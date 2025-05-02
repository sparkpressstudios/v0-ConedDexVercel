export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ConeDex</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #FF6B6B;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    h1, h2, h3 {
      color: #FF6B6B;
    }
    a {
      color: #FF6B6B;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://conedex.com/logo.png" alt="ConeDex Logo" class="logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
      <p>123 Ice Cream Lane, Flavor City, FC 12345</p>
      <p><a href="https://conedex.com/unsubscribe">Unsubscribe</a> | <a href="https://conedex.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`
