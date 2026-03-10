import jwt from "jsonwebtoken";

class JwtService {
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0,
      },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );
  }

  generateRefreshToken(userId) {
    const rotationWindow = 10 * 24 * 60 * 60 * 1000;

    return jwt.sign(
      {
        _id: userId,
        rotateAt: Date.now() + rotationWindow
      },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret);
    } catch (error) {
      return null;
    }
  }

  isTokenRotationNeeded(decodedToken) {
    return decodedToken.rotateAt && Date.now() > decodedToken.rotateAt;
  }
}

export const jwtService = new JwtService();