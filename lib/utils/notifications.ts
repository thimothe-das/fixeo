// Browser notification utilities for new messages

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function showMessageNotification(
  senderName: string,
  message: string,
  onClick?: () => void
) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(`Nouveau message de ${senderName}`, {
      body: message,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "new-message",
      requireInteraction: false,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      if (onClick) {
        onClick();
      }
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

export function updateDocumentTitle(unreadCount: number) {
  const baseTitle = document.title.replace(/^\(\d+\)\s/, "");
  
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
}

export function playNotificationSound() {
  // Create a simple notification sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
}

export function isDocumentHidden(): boolean {
  return document.hidden || document.visibilityState === "hidden";
}

// Hook to handle notification on new message
export function handleNewMessageNotification(
  senderName: string,
  messageContent: string,
  currentUserId: number,
  senderId: number,
  onNotificationClick?: () => void
) {
  // Don't notify for own messages
  if (senderId === currentUserId) {
    return;
  }

  // Only show notification if document is hidden
  if (isDocumentHidden()) {
    showMessageNotification(senderName, messageContent, onNotificationClick);
    playNotificationSound();
  } else {
    // Just play sound if document is visible
    playNotificationSound();
  }
}

