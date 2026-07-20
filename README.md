# Private P2P CCTV

## 1. Executive Summary and Motivation

In an era increasingly defined by data commodification and persistent surveillance, the sanctity of personal privacy is paramount. Traditional closed-circuit television (CCTV) systems and contemporary smart home security cameras predominantly rely on centralized cloud infrastructure. While this architecture offers convenience, it fundamentally compromises user privacy. Video feeds are routed through third-party servers, stored in remote databases, and subjected to opaque data retention policies. Furthermore, centralized repositories constitute high-value targets for malicious actors, leading to frequent and catastrophic data breaches where intimate domestic footage is exposed to the public internet.

The **Private P2P CCTV** application represents a paradigm shift in personal security monitoring. It is engineered from the ground up to eliminate the middleman, operating entirely on a decentralized, peer-to-peer (P2P) networking topology. By establishing direct encrypted connections between the transmitting camera device and the receiving viewer device, the application ensures that video streams never traverse or reside on unauthorized servers. This project leverages the robust capabilities of modern mobile hardware, transforming ubiquitous smartphones or tablets into highly secure, low-latency surveillance nodes. It is an uncompromising solution for individuals who demand absolute sovereignty over their data and physical environments.

---

## 2. Technical Architecture and Technology Stack

To achieve stringent performance, security, and maintainability requirements, the application is built upon a cutting-edge, highly optimized technology stack. The architecture is intentionally decoupled, separating UI presentation, state management, and complex native device interactions.

- **React Native & The New Architecture (Fabric/TurboModules)**: The core framework providing a unified codebase for both iOS and Android platforms. By enabling React Native's New Architecture, the application benefits from synchronous C++ interoperability, eliminating the asynchronous bridge bottleneck. This is critical for high-throughput operations such as real-time video processing and frame rendering.
- **Expo & Expo Router**: Expo provides a deterministic build environment and a comprehensive suite of native modules. The Expo Router implements filesystem-based routing, offering deep linking, nested layouts, and a predictable navigation hierarchy that mirrors modern web development paradigms.
- **Zustand**: A small, fast, and scalable bearbones state-management solution. In this application, Zustand eschews boilerplate in favor of a minimalist API, efficiently handling global states such as active connection statuses, device roles, and stream metadata without triggering unnecessary re-renders.
- **React Native MMKV**: A highly efficient, synchronous key-value storage framework powered by Tencent's MMKV. It replaces traditional asynchronous storage mechanisms like AsyncStorage, allowing the app to read and write configuration data (e.g., the selected device role, theme preferences, and security tokens) instantly on the UI thread, ensuring zero-latency startup and configuration retrieval.
- **React Query (TanStack Query)**: While traditionally used for server-state caching, React Query is utilized here to manage asynchronous operations, signaling states, and eventual background synchronization tasks. It provides robust retry logic, error handling, and declarative data fetching lifecycles.
- **React Native Vision Camera**: A highly optimized camera library designed for the React Native New Architecture. It provides fine-grained control over frame rates, resolution, and format pipelines. Crucially, it supports custom frame processors via React Native Worklets, paving the way for on-device, real-time machine learning tasks such as motion detection and object recognition without compromising the main thread.
- **React Native WebRTC**: The foundational networking protocol of this application. WebRTC enables real-time communication (RTC) across browsers and mobile applications via simple APIs. It handles the immense complexity of NAT traversal (via STUN/TURN servers), bandwidth estimation, and secure real-time transport protocol (SRTP) encryption, facilitating the direct peer-to-peer video streams.

---

## 3. Core Application Modes

The application operates fundamentally as a dual-role system. Upon initial configuration, the device must be strictly designated as either a **Camera Node** or a **Viewer Node**. This bifurcation allows the application to aggressively optimize resource allocation depending on its assigned task.

### 3.1. The Camera Node (Transmitter)
When configured as a Camera Node, the application optimizes for continuous, background-resilient video capture and transmission. The UI is minimized to reduce battery consumption and thermal throttling. The Vision Camera instance is initialized with specific constraints—balancing resolution and framerate against the available uplink bandwidth.
The Camera Node acts as the passive listener in the WebRTC signaling phase. Once an authorized Viewer Node attempts a connection via a secure signaling channel (facilitated by QR code exchange or a minimal WebSockets relay), the Camera Node negotiates the connection, generates the SDP (Session Description Protocol) offer/answer, and begins piping the raw video track into the WebRTC peer connection. Future iterations of this node will include algorithmic motion detection using frame processors, allowing the node to dynamically adjust bitrates or trigger local recordings only when anomalous activity is detected.

### 3.2. The Viewer Node (Receiver)
The Viewer Node is the active monitoring interface. It is optimized for low-latency decoding and rendering of incoming WebRTC streams. Upon launch, the Viewer Node attempts to establish a connection with the paired Camera Node. The UI provides a clean, distraction-free environment to monitor the feed, complete with connection metrics, latency indicators, and controls for two-way audio (planned). The architecture ensures that multiple viewer nodes could theoretically subscribe to a single camera node, though the primary focus remains a secure 1:1 topological mapping for maximum privacy and minimal network overhead.

---

## 4. Design Language and User Experience

In stark contrast to consumer applications laden with gratuitous animations, complex gradients, and "glassmorphism" effects, the Private P2P CCTV application adopts an ultra-minimalist, utilitarian design philosophy inspired heavily by Material Design 3 guidelines.

- **Monochromatic Purity**: The interface utilizes a strict white background with high-contrast black typography. This maximizes legibility under various lighting conditions and reduces cognitive load during high-stress monitoring scenarios.
- **Utilitarian Components**: UI elements such as Buttons and Cards are devoid of unnecessary styling. They rely on precise geometric proportions, subtle structural borders, and consistent spacing (utilizing a mathematical 8pt grid system).
- **Function Over Form**: Every pixel on the screen serves a functional purpose. The absence of heavy CSS-in-JS abstractions or complex animation libraries ensures that the application's render cycle remains incredibly fast, leaving maximum CPU and GPU overhead available for video decoding and network handling.

---

## 5. Security and Privacy Implementation

Security is not a feature of this application; it is its foundational premise. The peer-to-peer architecture guarantees that video data is never intercepted or stored by a centralized authority.

1. **Signaling and Authentication**: The initial handshake between the Camera and Viewer requires an exchange of cryptographic material. This is achieved out-of-band (e.g., scanning a dynamically generated QR code containing connection parameters) or via an ephemeral, end-to-end encrypted signaling server that retains zero knowledge of the session.
2. **DTLS-SRTP Encryption**: Once the peer connection is established, all media (video and audio) and data channels are forcefully encrypted using Datagram Transport Layer Security (DTLS) and the Secure Real-time Transport Protocol (SRTP). This provides robust protection against eavesdropping, tampering, and message forgery.
3. **No-Log Paradigm**: The application generates no telemetry, crash reports, or analytics that are transmitted externally. All application states and configurations are stored securely within the local MMKV vault.

---

## 6. Project Folder Architecture

The project adheres to a highly scalable and predictable directory structure, preventing technical debt as the application's complexity increases.

```
/
├── app/                  # Expo Router directory (Screens and Navigation logic)
│   ├── _layout.tsx       # Root layout provider (QueryClient, Theme)
│   ├── index.tsx         # Splash and initialization
│   ├── role-selection.tsx# Node designation
│   ├── camera.tsx        # Camera node interface
│   └── viewer.tsx        # Viewer node interface
├── src/                  # Core application source code
│   ├── components/       # Reusable, stateless UI primitives (Screen, Button, Card)
│   ├── constants/        # Global constants and configuration variables
│   ├── hooks/            # Custom React Hooks (e.g., useWebRTC, useSignaling)
│   ├── services/         # External integrations (React Query Client, WebRTC managers)
│   ├── store/            # Global state management (Zustand + MMKV integrations)
│   ├── theme/            # Design tokens (Colors, Spacing, Typography)
│   ├── types/            # TypeScript interface definitions
│   └── utils/            # Pure helper functions (formatting, math, logging)
└── assets/               # Static assets (fonts, local images)
```

## 7. Getting Started

To initialize the development environment and build the application from source:

1. **Prerequisites**: Ensure you have Node.js (v18+), Watchman, and the React Native CLI installed alongside a properly configured iOS Simulator (macOS only) or Android Emulator.
2. **Installation**:
   Clone the repository and install the dependencies:
   ```bash
   git clone git@github.com:Paardhu22/P2P_CCTV.git
   cd P2P_CCTV
   npm install
   ```
3. **Running the Application**:
   Start the Expo development server:
   ```bash
   npm start
   ```
   Press `a` to launch on Android, or `i` to launch on iOS. For testing WebRTC capabilities, deploying to physical devices rather than simulators is highly recommended.

---

*This document outlines the Phase 1 foundation and theoretical framework. Subsequent phases will integrate the React Native Vision Camera, finalize the WebRTC signaling protocol, and implement real-time QR-code-based device pairing.*
