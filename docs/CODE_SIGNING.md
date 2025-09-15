# Code Signing Setup for macOS

This guide explains how to set up code signing for distributing Candlebar on macOS.

## Why Code Sign?

Code signing is important for:
- Preventing macOS Gatekeeper warnings
- Building trust with users
- Enabling automatic updates
- Future Mac App Store distribution

## Option 1: Without Code Signing (Development/Testing)

The GitHub Actions workflow will still build the app without code signing. Users will need to:
1. Right-click the app and select "Open" the first time
2. Click "Open" in the security dialog

## Option 2: With Code Signing (Recommended for Distribution)

### Prerequisites
- Apple Developer Account ($99/year)
- macOS machine for certificate generation

### Steps

1. **Create Apple Developer Account**
   - Sign up at https://developer.apple.com

2. **Generate Certificates**
   ```bash
   # In Keychain Access, request a certificate from Certificate Authority
   # Upload the request to Apple Developer Portal
   # Download and install the Developer ID Application certificate
   ```

3. **Export Certificate**
   ```bash
   # Export as .p12 file with password
   # Convert to base64 for GitHub Secrets:
   base64 -i Certificates.p12 -o Certificates.base64
   ```

4. **Add GitHub Secrets**
   
   Go to your repository Settings → Secrets and variables → Actions, and add:
   
   - `APPLE_CERTIFICATE`: Base64 encoded .p12 certificate
   - `APPLE_CERTIFICATE_PASSWORD`: Password for the .p12 file
   - `APPLE_SIGNING_IDENTITY`: Your Developer ID (e.g., "Developer ID Application: Your Name (TEAMID)")
   - `APPLE_ID`: Your Apple ID email (optional, for notarization)
   - `APPLE_PASSWORD`: App-specific password (optional, for notarization)
   - `APPLE_TEAM_ID`: Your Team ID from Apple Developer Portal

5. **Test Build**
   ```bash
   # Create a tag to trigger the release workflow
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Option 3: Local Signing Only

For local builds, you can sign manually:

```bash
# Build the app
npm run tauri:build

# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" \
  ./src-tauri/target/release/bundle/macos/Candlebar.app

# Verify signing
codesign --verify --verbose ./src-tauri/target/release/bundle/macos/Candlebar.app
```

## Notarization (Optional)

For the best user experience, notarize your app:

```bash
# Notarize
xcrun notarytool submit Candlebar.dmg \
  --apple-id your-apple-id@email.com \
  --password your-app-specific-password \
  --team-id YOUR_TEAM_ID \
  --wait

# Staple the notarization
xcrun stapler staple Candlebar.dmg
```

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Tauri Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-macos)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)