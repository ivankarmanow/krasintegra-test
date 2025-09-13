class UserNotFoundException(Exception):
    def __init__(self, user_id: int) -> None:
        self.user_id = user_id

    def __str__(self) -> str:
        return f"User {self.user_id} not found"
