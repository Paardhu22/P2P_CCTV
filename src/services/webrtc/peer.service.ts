import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, MediaStream } from 'react-native-webrtc';
import { signalingService } from '../signaling/signaling.service';
import { WebRTCPeerState, PeerStateInfo } from './types';
import { Logger } from '../../utils/logger';

type StateListener = (state: PeerStateInfo) => void;

class PeerService {
  private pc: RTCPeerConnection | null = null;
  private currentPeerId: string | null = null;
  private unsubscribeSignaling: (() => void) | null = null;
  private stateListeners: Set<StateListener> = new Set();
  
  private connectionState: WebRTCPeerState = 'Disconnected';
  private signalingState: string = 'closed';
  private iceConnectionState: string = 'closed';
  private remoteStream: MediaStream | null = null;
  private localStream: MediaStream | null = null;

  constructor() {
    this.unsubscribeSignaling = signalingService.subscribeToMessages(this.handleSignalingMessage.bind(this));
  }

  public subscribeToState(listener: StateListener) {
    this.stateListeners.add(listener);
    this.notifyListeners();
    return () => this.stateListeners.delete(listener);
  }

  private notifyListeners() {
    this.stateListeners.forEach(l => l({
      connectionState: this.connectionState,
      signalingState: this.signalingState,
      iceConnectionState: this.iceConnectionState,
      remoteStream: this.remoteStream
    }));
  }

  private updateStates() {
    if (!this.pc) return;
    
    this.signalingState = this.pc.signalingState;
    this.iceConnectionState = this.pc.iceConnectionState;
    
    const pcState = this.pc.connectionState;
    if (pcState === 'connected') this.connectionState = 'Connected';
    else if (pcState === 'connecting' || pcState === 'new') this.connectionState = 'Connecting';
    else if (pcState === 'failed') this.connectionState = 'Failed';
    else if (pcState === 'closed') this.connectionState = 'Closed';
    else if (pcState === 'disconnected') this.connectionState = 'Disconnected';
    
    this.notifyListeners();
  }

  private createPeerConnection(peerId: string) {
    if (this.pc) {
      this.close();
    }

    this.currentPeerId = peerId;
    this.connectionState = 'Connecting';

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.pc!.addTrack(track, this.localStream!);
      });
    }

    const pcAny = this.pc as any;
    pcAny.addEventListener('connectionstatechange', () => this.updateStates());
    pcAny.addEventListener('iceconnectionstatechange', () => {
      this.updateStates();
      if (this.pc && (this.pc.iceConnectionState === 'failed' || this.pc.iceConnectionState === 'disconnected')) {
        Logger.warn("ICE Connection failed/disconnected. Attempting ICE Restart.");
        this.reconnectPeer();
      }
    });
    pcAny.addEventListener('signalingstatechange', () => this.updateStates());

    pcAny.addEventListener('icecandidate', (event: any) => {
      if (event.candidate && this.currentPeerId) {
        signalingService.sendToDevice(this.currentPeerId, {
          type: 'ice_candidate',
          candidate: event.candidate.toJSON()
        } as any);
      }
    });

    pcAny.addEventListener('track', (event: any) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.notifyListeners();
      }
    });

    this.updateStates();
  }

  public async connectToPeer(peerId: string) {
    try {
      this.createPeerConnection(peerId);
      
      if (!this.pc) return;
      const offer = await this.pc.createOffer({});
      await this.pc.setLocalDescription(offer);
      
      signalingService.sendToDevice(peerId, {
        type: 'offer',
        sdp: offer.sdp
      } as any);
    } catch (e) {
      Logger.warn("Failed to create offer:", e);
      this.connectionState = 'Failed';
      this.notifyListeners();
    }
  }

  private async reconnectPeer() {
    if (!this.pc || !this.currentPeerId) return;
    try {
      const offer = await this.pc.createOffer({ iceRestart: true });
      await this.pc.setLocalDescription(offer);
      signalingService.sendToDevice(this.currentPeerId, {
        type: 'offer',
        sdp: offer.sdp
      } as any);
    } catch (e) {
      Logger.error("Failed ICE restart:", e);
    }
  }

  public close() {
    if (this.pc) {
      // Remove all tracks
      this.pc.getSenders().forEach(sender => this.pc?.removeTrack(sender));
      this.pc.close();
      this.pc = null;
    }
    this.currentPeerId = null;
    this.connectionState = 'Closed';
    this.signalingState = 'closed';
    this.iceConnectionState = 'closed';
    this.remoteStream = null;
    this.localStream = null;
    this.notifyListeners();
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    // If connection already exists, we might need renegotiation. 
    // For this simple case, we assume setLocalStream is called before connection.
  }

  private async handleSignalingMessage(msg: any) {
    const sender = msg.senderDeviceId;
    if (!sender) return;

    if (msg.type === 'offer') {
      try {
        this.createPeerConnection(sender);
        if (!this.pc) return;

        await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        
        signalingService.sendToDevice(sender, {
          type: 'answer',
          sdp: answer.sdp
        } as any);
      } catch (e) {
        Logger.warn("Error handling offer:", e);
      }
    } else if (msg.type === 'answer') {
      try {
        if (this.pc && sender === this.currentPeerId) {
          await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
        }
      } catch (e) {
        Logger.warn("Error handling answer:", e);
      }
    } else if (msg.type === 'ice_candidate') {
      try {
        if (this.pc && sender === this.currentPeerId) {
          await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
      } catch (e) {
        Logger.warn("Error adding ICE candidate:", e);
      }
    }
  }
}

export const peerService = new PeerService();
