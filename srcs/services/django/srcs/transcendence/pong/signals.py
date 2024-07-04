
def post_migrate_handler(sender, **kwargs):
    # Your database operations here
    print("Running database operations after migrations")

    # OR using Django ORM
    from pong.models import BaseUser
    BaseUser.objects.all().update(online=0)