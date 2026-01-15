"""
Notification Service
Helper functions for sending notifications to users
"""
from typing import Optional
from sqlalchemy.orm import Session
from core.database import SessionLocalUsers
from modules.users.models.user import User
from modules.notifications.models.notification import Notification
from core.logging import setup_logging

logger = setup_logging()


def send_notification_to_department(
    title: str,
    message: str,
    target_department: str,
    notification_type: str = "info",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None
) -> int:
    """
    Send notification to all users in a specific department
    
    Args:
        title: Notification title
        message: Notification message
        target_department: Department ID (e.g., "merchandising", "sample_department")
        notification_type: Type of notification (info, warning, success, error)
        related_entity_type: Type of related entity (e.g., "sample_status")
        related_entity_id: ID of related entity (e.g., sample_id)
    
    Returns:
        Number of notifications sent
    """
    users_db = SessionLocalUsers()
    count = 0
    
    try:
        # Get all active users
        all_users = users_db.query(User).filter(
            User.is_active == True
        ).all()
        
        # Filter users who have the target department in their department_access array
        users = [
            user for user in all_users 
            if user.department_access and target_department in user.department_access
        ]
        
        if not users:
            logger.warning(f"No active users found for department: {target_department}")
            return 0
        
        # Create notification for each user
        for user in users:
            notification = Notification(
                user_id=user.id,
                title=title,
                message=message,
                type=notification_type,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                target_department=target_department
            )
            users_db.add(notification)
            count += 1
        
        users_db.commit()
        logger.info(f"Sent {count} notifications to department: {target_department}")
        return count
        
    except Exception as e:
        users_db.rollback()
        logger.error(f"Error sending notifications to department {target_department}: {str(e)}", exc_info=True)
        return 0
    finally:
        users_db.close()


def send_notification_to_user(
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    target_department: Optional[str] = None
) -> bool:
    """
    Send notification to a specific user
    
    Args:
        user_id: User ID to send notification to
        title: Notification title
        message: Notification message
        notification_type: Type of notification (info, warning, success, error)
        related_entity_type: Type of related entity
        related_entity_id: ID of related entity
        target_department: Target department
    
    Returns:
        True if notification sent successfully, False otherwise
    """
    users_db = SessionLocalUsers()
    
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            target_department=target_department
        )
        users_db.add(notification)
        users_db.commit()
        logger.info(f"Sent notification to user ID: {user_id}")
        return True
        
    except Exception as e:
        users_db.rollback()
        logger.error(f"Error sending notification to user {user_id}: {str(e)}", exc_info=True)
        return False
    finally:
        users_db.close()

