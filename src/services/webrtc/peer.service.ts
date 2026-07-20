import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { signalingService } from '../signaling/signaling.service';
import { WebRTCPeerState, PeerStateInfo } from './types';

type StateListener = (state: PeerStateInfo) => void;

class PeerService {
  private pc: RTCPeerConnection | null = null;
  private currentPeerId: string | null = null;
  private unsubscribeSignaling: (() => void) | null = null;
  private stateListeners: Set<StateListener> = new Set();
  
  private connectionState: WebRTCPeerState = 'Disconnected';
  private signalingState: string = 'closed';
  private iceConnectionState: string = 'closed';

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
      iceConnectionState: this.iceConnectionState
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

    const pcAny = this.pc as any;
    pcAny.addEventListener('connectionstatechange', () => this.updateStates());
    pcAny.addEventListener('iceconnectionstatechange', () => this.updateStates());
    pcAny.addEventListener('signalingstatechange', () => this.updateStates());

    pcAny.addEventListener('icecandidate', (event: any) => {
      if (event.candidate && this.currentPeerId) {
        signalingService.sendToDevice(this.currentPeerId, {
          type: 'ice_candidate',
          candidate: event.candidate.toJSON()
        } as any);
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
      console.warn("Failed to create offer:", e);
      this.connectionState = 'Failed';
      this.notifyListeners();
    }
  }

  public close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.currentPeerId = null;
    this.connectionState = 'Closed';
    this.signalingState = 'closed';
    this.iceConnectionState = 'closed';
    this.notifyListeners();
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
        console.warn("Error handling offer:", e);
      }
    } else if (msg.type === 'answer') {
      try {
        if (this.pc && sender === this.currentPeerId) {
          await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
        }
      } catch (e) {
        console.warn("Error handling answer:", e);
      }
    } else if (msg.type === 'ice_candidate') {
      try {
        if (this.pc && sender === this.currentPeerId) {
          await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
      } catch (e) {
        console.warn("Error adding ICE candidate:", e);
      }
    }
  }
}

export const peerService = new PeerService();
