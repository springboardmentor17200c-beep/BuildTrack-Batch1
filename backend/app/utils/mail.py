def send_password_reset_otp(
    email: str,
    otp: str,
):
    """
    TODO

    Replace with SMTP.

    For development we simply print the OTP.
    """

    print("=" * 60)
    print("PASSWORD RESET OTP")
    print(email)
    print(otp)
    print("=" * 60)