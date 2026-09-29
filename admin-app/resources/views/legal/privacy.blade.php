<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy — Prompt Saar</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #E11D48;
            --primary-dark: #BE123C;
            --accent: #FF7A00;
            --bg: #F8F9FA;
            --surface: #FFFFFF;
            --border: #E5E7EB;
            --text: #111827;
            --text-muted: #6B7280;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.65;
            padding: 40px 20px;
        }
        .container {
            max-width: 820px;
            margin: 0 auto;
        }
        .header-card {
            background: var(--surface);
            border-radius: 20px;
            padding: 36px;
            border: 1px solid rgba(225, 29, 72, 0.2);
            box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08);
            margin-bottom: 24px;
        }
        .badge {
            display: inline-block;
            background: var(--primary);
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.6px;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.8px;
            margin-bottom: 6px;
        }
        .date {
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 18px;
        }
        .intro {
            font-size: 15px;
            color: #374151;
            margin-bottom: 20px;
        }
        .pill-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
        }
        .pill {
            background: var(--bg);
            border: 1px solid var(--border);
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text);
        }
        .card {
            background: var(--surface);
            border-radius: 18px;
            padding: 30px;
            border: 1px solid var(--border);
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        h2 {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.3px;
            margin-bottom: 14px;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        h2::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 18px;
            background: var(--primary);
            border-radius: 2px;
        }
        p {
            font-size: 14px;
            color: #4B5563;
            margin-bottom: 14px;
        }
        ul {
            list-style: none;
            margin-bottom: 14px;
        }
        li {
            font-size: 13.5px;
            color: #4B5563;
            padding: 10px 14px;
            background: var(--bg);
            border-radius: 10px;
            margin-bottom: 8px;
            border: 1px solid #EEF2F6;
        }
        li strong {
            color: var(--text);
            display: block;
            margin-bottom: 2px;
        }
        .contact-box {
            background: var(--bg);
            padding: 16px;
            border-radius: 10px;
            border: 1px solid var(--border);
            margin-top: 10px;
        }
        .contact-box p {
            margin-bottom: 4px;
            font-size: 13.5px;
        }
        footer {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-card">
            <span class="badge">LEGAL COMPLIANCE</span>
            <h1>Privacy Policy</h1>
            <div class="date">Effective Date: September 29, 2026 • Version 1.0</div>
            <p class="intro">
                Prompt Saar ("we", "our", or "us"), provided by Fillosoft, respects your privacy. This policy outlines our transparent data practices, Google AdMob advertising integrations, and your individual privacy rights when utilizing the Prompt Saar mobile application and services.
            </p>
            <div class="pill-row">
                <span class="pill">✓ No Selling of Personal Data</span>
                <span class="pill">🔒 TLS/HTTPS Encrypted API</span>
                <span class="pill">📱 Privacy-Preserving Device ID</span>
            </div>
        </div>

        <div class="card">
            <h2>1. Information We Collect</h2>
            <p>We collect minimal information necessary to deliver prompt discovery, rewarded unlocks, and persistent synchronization:</p>
            <ul>
                <li><strong>Device & Installation Identifiers</strong>An anonymous cryptographically generated unique device ID stored locally in SecureStore to keep track of your unlocked prompts, coin balances, and saved bookmarks without requiring mandatory social logins.</li>
                <li><strong>App Activity & Unlocked Library</strong>Records of prompts bookmarked or unlocked, and coin ledger transactions (e.g. ad reward completions, prompt unlocks) to prevent loss of your personal library.</li>
                <li><strong>Push Notification Tokens</strong>When notifications are enabled, we collect your Firebase Cloud Messaging (FCM) registration token to deliver push notifications about newly released prompts, reward opportunities, and platform updates.</li>
                <li><strong>Technical & Diagnostics</strong>Standard network telemetry including IP address, operating system version (Android/iOS), app version, and crash logs to maintain uptime and performance.</li>
            </ul>
        </div>

        <div class="card">
            <h2>2. How We Use Your Information</h2>
            <p>Your data is strictly utilized for the following legitimate operational purposes:</p>
            <ul>
                <li><strong>Core Functionality:</strong> Facilitating prompt discovery, copy-to-clipboard, AI deep linking, and maintaining your unlocked library.</li>
                <li><strong>Virtual Economy & Anti-Fraud:</strong> Crediting coins upon verified video ad completion, applying daily quota limits, and preventing automated exploit scripts or unlock tampering.</li>
                <li><strong>Communications:</strong> Sending occasional push notifications regarding new AI prompts or system notifications (opt out anytime in device settings).</li>
            </ul>
        </div>

        <div class="card">
            <h2>3. Third-Party Services & Google AdMob</h2>
            <p>Prompt Saar displays rewarded advertisements to make premium AI prompts accessible without mandatory upfront fees. We partner with:</p>
            <ul>
                <li><strong>Google AdMob (Google LLC):</strong> Serves rewarded advertisements. AdMob uses device identifiers (such as Google Advertising ID or IDFA) to deliver personalized or contextual ads and verify reward playback. For details, refer to Google's Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" style="color: var(--primary); font-weight: 700;">policies.google.com/privacy</a>.</li>
                <li><strong>Firebase Cloud Messaging (Google LLC):</strong> Dispatches push notifications. No personal message contents are shared.</li>
            </ul>
        </div>

        <div class="card">
            <h2>4. External AI Platforms</h2>
            <p>Prompt Saar offers one-tap bridges to launch OpenAI ChatGPT and Google Gemini. When you tap "Open in ChatGPT" or "Open in Gemini":</p>
            <p>• The prompt text is copied to your device clipboard or passed via standard deep link protocols.<br>
            • Your interaction within third-party AI platforms is governed independently by OpenAI's or Google's respective Terms and Privacy Policies.<br>
            • Prompt Saar does not receive, read, or store any conversational outputs you generate inside external AI apps.</p>
        </div>

        <div class="card">
            <h2>5. Your Rights & Data Choices</h2>
            <p>Depending on your jurisdiction (including GDPR, CCPA/CPRA, and India's Digital Personal Data Protection Act), you have rights regarding your data:</p>
            <ul>
                <li><strong>Clear Local Data:</strong> You can instantly delete all cached prompts, device identifiers, and bookmarks directly inside the app under Profile → "Clear Local App Data".</li>
                <li><strong>Push Notification Controls:</strong> You may disable notification permissions at any time via your device's operating system Application Settings.</li>
                <li><strong>Ad Tracking Opt-Out:</strong> You can reset or opt out of personalized ads by adjusting Google Advertising ID settings on Android or tracking permissions on iOS.</li>
            </ul>
        </div>

        <div class="card">
            <h2>6. Contact & Grievance Redressal</h2>
            <p>If you have any questions, concerns, or data deletion requests regarding this Privacy Policy, please reach out to our privacy desk:</p>
            <div class="contact-box">
                <p><strong>Publisher:</strong> Fillosoft / Prompt Saar</p>
                <p><strong>Developer Support:</strong> <a href="mailto:support@fillosoft.com" style="color: var(--primary); font-weight: 700;">support@fillosoft.com</a></p>
                <p><strong>Subject Line:</strong> Privacy / Data Inquiries</p>
            </div>
        </div>

        <footer>
            &copy; 2026 Fillosoft • Prompt Saar. All rights reserved.
        </footer>
    </div>
</body>
</html>
