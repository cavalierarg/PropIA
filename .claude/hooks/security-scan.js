#!/usr/bin/env node
// PostToolUse hook: escanea secretos hardcodeados después de Write/Edit
// Compatible con Windows, macOS y Linux

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const toolName = input.tool_name || '';

    if (!['Write', 'Edit'].includes(toolName)) process.exit(0);

    const toolInput = input.tool_input || {};
    const content = toolInput.content || toolInput.new_string || '';
    const filePath = toolInput.file_path || '';

    // Saltear archivos irrelevantes
    if (/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf)$/i.test(filePath)) process.exit(0);
    if (/(node_modules|\.git|\.next|dist|build)[\\/]/.test(filePath)) process.exit(0);
    if (/\.env(\.\w+)?$/.test(filePath)) process.exit(0); // .env es para eso

    const PATTERNS = [
      { regex: /sk-ant-[a-zA-Z0-9\-_]{20,}/, msg: 'Anthropic API key detectada' },
      { regex: /sk_(test|live)_[a-zA-Z0-9]{20,}/, msg: 'Clerk/Stripe Secret Key detectada' },
      { regex: /eyJ[a-zA-Z0-9\-_]{40,}\.eyJ/, msg: 'JWT / Supabase key detectada' },
      { regex: /AKIA[0-9A-Z]{16}/, msg: 'AWS Access Key detectada' },
      { regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, msg: 'Clave privada detectada' },
      { regex: /LEMONSQUEEZY_WEBHOOK_SECRET\s*=\s*["']?[a-zA-Z0-9]{16,}/, msg: 'LemonSqueezy secret hardcodeado' },
    ];

    const warnings = PATTERNS.filter(({ regex }) => regex.test(content)).map(({ msg }) => `- ${msg}`);

    if (warnings.length > 0) {
      const output = {
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: [
            `⚠️  Posible secreto detectado en ${filePath}:`,
            ...warnings,
            'Usá variables de entorno (.env.local) en lugar de valores hardcodeados.',
          ].join('\n'),
        },
      };
      process.stdout.write(JSON.stringify(output));
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
});
