# Orbit Systems / OSai Hub

The OSai hub is the trust, identity, access, portfolio, and feedback layer for Orbit Systems projects.

## Start here

- [OSai product and experience documentation](docs/README.md)
- [Foundation roadmap](FOUNDATION_ROADMAP.md)
- [Next.js App Router entry](app/[[...slug]]/page.tsx)
- [Shared client application](src/App.tsx)

Future OSai chats should read `docs/README.md` first and follow its task-specific reading order before changing onboarding, navigation, authorization, project access, beta, feedback, or administrative behavior.

## Local development

```bash
npm install
npm run dev
```

The Next.js development server runs at [http://localhost:3003](http://localhost:3003).

Production verification:

```bash
npm run build
npm run start
```

## Contact chat and AI Assist

The tawk.to widget loads only on `/contact` when both public identifiers are configured:

```bash
NEXT_PUBLIC_TAWK_PROPERTY_ID=your-property-id
NEXT_PUBLIC_TAWK_WIDGET_ID=your-widget-id
```

Find both values in tawk.to under **Administration → Channels → Chat Widget**. The Widget ID is the final segment of the Direct Chat Link. Add both variables to local development and to the Vercel Production environment.

AI Assist is configured in tawk.to rather than in this repository. For the correct property, enable **Add-ons → AI Assist**, create an agent under **Automations**, add `https://orbitsystems.ai` and approved OSai documents as data sources, select the Live Chat channel, configure lead capture and human escalation, then test the agent before enabling it for visitors. See tawk.to's [AI Assist setup guide](https://help.tawk.to/article/getting-started-with-ai-assist).
