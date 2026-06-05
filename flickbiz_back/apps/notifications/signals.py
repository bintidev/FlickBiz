from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.reviews.models import Review
from apps.media.models import Movie
from .models import Notification

@receiver(post_save, sender=Review)
def create_notification_on_favorite_movie_review(sender, instance, created, **kwargs):
    if created:
        movie = instance.movie
        if movie:
            # Safe way to get the reviewer's username, even if not pre-fetched
            reviewer_username = instance.user.username if instance.user else "A user"
            
            try:
                users_interested = movie.favorited_by.all()
            except AttributeError:
                return

            for user in users_interested:
                # Compare IDs directly to avoid memory lazy-loading issues
                if user.id != instance.user_id: 
                    Notification.objects.create(
                        user=user,
                        type=Notification.TYPE_NEW_CONTENT,
                        message=f"New review available for {movie.title}.",
                        movie=movie,
                        review=instance
                    )
    print("📢 [SIGNAL TRIGGERED] Alguien ha guardado una Review!")
    
    if created:
        print("✅ [SIGNAL] La review es nueva (created=True)")
        movie = instance.movie
        print(f"🎬 [SIGNAL] Película asociada: {movie}")
        
        if movie:
            # IMPORTANTE: Aquí imprimiremos cuántos usuarios tienen esta película en favoritos.
            # Si sale 0, este es el problema.
            try:
                users_interested = movie.favorited_by.all()
                print(f"👥 [SIGNAL] Usuarios interesados encontrados: {users_interested.count()}")
            except AttributeError as e:
                print(f"❌ [SIGNAL ERROR] 'movie.favorited_by' falló. El related_name podría ser incorrecto: {e}")
                return

            for user in users_interested:
                print(f"👤 [SIGNAL] Evaluando usuario: {user.username} (Reviewer: {instance.user.username})")
                if user != instance.user:
                    notif = Notification.objects.create(
                        user=user,
                        type=Notification.TYPE_NEW_CONTENT,
                        message=f"New review available for {movie.title}.",
                        movie=movie,
                        review=instance
                    )
                    print(f"🚀 [SIGNAL SUCCESS] Notificación ID {notif.id} creada para {user.username}")
                else:
                    print("⏭️ [SIGNAL] Saltado: El usuario interesado es el mismo que escribió la review.")
    else:
        print("ℹ️ [SIGNAL] La review no es nueva, fue una edición (created=False)")