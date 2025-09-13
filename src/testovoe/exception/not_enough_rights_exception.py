class NotEnoughRightsException(Exception):
    def __str__(self):
        return f"User is not admin"