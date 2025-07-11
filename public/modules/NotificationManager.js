
// Notification management utility
class NotificationManager {
  showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.mymagpye-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `mymagpye-notification mymagpye-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 120px;
      right: 20px;
      z-index: 10001;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}
