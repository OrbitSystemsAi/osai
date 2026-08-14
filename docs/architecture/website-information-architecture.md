# OSai Website Information Architecture

## Purpose

This document defines the pages, navigation menus, and principal calls to action across the OSai public website, authenticated member hub, protected project rooms, beta experience, and internal administration area.

## Global flow

Solid edges represent navigation or system progression. Dashed edges represent a primary CTA.

```mermaid
flowchart TD
    START([Visitor arrives])

    subgraph PUBLIC[Public website]
        PUBNAV[Public navigation<br/>Home · Venture · Innovation · Consulting · Insights · Contact]
        HOME[Home]
        ABOUT[Innovation]
        PROJECTS[Venture]
        PROJECTTEASER[Public project page]
        ACCESS[Consulting]
        UPDATES[Insights]
        CONTACT[Contact]
        LEGAL[Privacy · Terms]
        REQUEST[Request Access]
        INVITE[Accept Invitation]
        SIGNIN[Sign In]

        PUBNAV --> HOME
        PUBNAV --> ABOUT
        PUBNAV --> PROJECTS
        PUBNAV --> ACCESS
        PUBNAV --> UPDATES
        PUBNAV --> CONTACT
        PROJECTS --> PROJECTTEASER
        HOME --> LEGAL
    end

    START --> HOME
    HOME -. Explore projects .-> PROJECTS
    HOME -. Learn about OSai .-> ABOUT
    HOME -. Request access .-> REQUEST
    PROJECTTEASER -. Request project access .-> REQUEST
    ACCESS -. See how membership works .-> REQUEST
    UPDATES -. Explore projects .-> PROJECTS

    subgraph ONBOARDING[Invitation and onboarding]
        INVITELANDING[Invitation page]
        CREATE[Create account]
        VERIFY[Verify email]
        LOGIN[Sign in]
        RESET[Recover account]
        NDAPREVIEW[General NDA explanation]
        DOCUSIGN[Sign with DocuSign]
        NDAPENDING[Signature processing]
        WELCOME[Membership confirmed]

        INVITELANDING --> CREATE
        CREATE --> VERIFY
        VERIFY --> NDAPREVIEW
        NDAPREVIEW --> DOCUSIGN
        DOCUSIGN --> NDAPENDING
        NDAPENDING --> WELCOME
        LOGIN --> RESET
    end

    REQUEST -. Submit request .-> INVITELANDING
    INVITE -. Create account .-> INVITELANDING
    SIGNIN --> LOGIN
    LOGIN --> WELCOME

    subgraph MEMBER[Authenticated member hub]
        MEMBERNAV[Member navigation<br/>Pulse · Dashboard · Projects · Agreements · Beta Programs · Updates · Profile]
        PULSE[Pulse]
        DASHBOARD[Dashboard]
        CATALOG[Project catalog]
        AGREEMENTS[My agreements]
        BETAS[Beta programs]
        MEMBERUPDATES[Member updates]
        PROFILE[Profile and security]
        NOTIFICATIONS[Notifications]

        MEMBERNAV --> PULSE
        MEMBERNAV --> DASHBOARD
        MEMBERNAV --> CATALOG
        MEMBERNAV --> AGREEMENTS
        MEMBERNAV --> BETAS
        MEMBERNAV --> MEMBERUPDATES
        MEMBERNAV --> PROFILE
        MEMBERNAV --> NOTIFICATIONS
    end

    WELCOME -. Enter member hub .-> DASHBOARD
    DASHBOARD -. Continue onboarding .-> AGREEMENTS
    DASHBOARD -. Explore available projects .-> CATALOG
    DASHBOARD -. View invitation .-> BETAS
    DASHBOARD -. Read latest update .-> MEMBERUPDATES

    subgraph PROJECT[Project access]
        MEMBERPROJECT[Member-level project overview]
        ACCESSCHECK{Project agreement required?}
        PROJECTREQUEST[Project access request]
        REQUESTPENDING[Access request pending]
        PROJECTNDA[Project agreement explanation]
        PROJECTSIGN[Accept or sign agreement]
        PROJECTROOM[Protected project room]

        MEMBERPROJECT --> ACCESSCHECK
        ACCESSCHECK -- No --> PROJECTROOM
        ACCESSCHECK -- Yes --> PROJECTREQUEST
        PROJECTREQUEST --> REQUESTPENDING
        REQUESTPENDING --> PROJECTNDA
        PROJECTNDA --> PROJECTSIGN
        PROJECTSIGN --> PROJECTROOM
    end

    CATALOG -. Open project .-> MEMBERPROJECT
    MEMBERPROJECT -. Request access .-> PROJECTREQUEST
    PROJECTNDA -. Review agreement .-> PROJECTSIGN
    PROJECTSIGN -. Enter project room .-> PROJECTROOM

    subgraph ROOM[Protected project room]
        PROJECTNAV[Project navigation<br/>Overview · Media · Deck · Milestones · Updates · Funding · Beta]
        OVERVIEW[Project overview]
        MEDIA[Private videos]
        DECK[Pitch deck]
        MILESTONES[Milestones]
        PROJECTUPDATES[Founder updates]
        FUNDING[Funding progress]
        BETAINVITE[Beta invitation]

        PROJECTNAV --> OVERVIEW
        PROJECTNAV --> MEDIA
        PROJECTNAV --> DECK
        PROJECTNAV --> MILESTONES
        PROJECTNAV --> PROJECTUPDATES
        PROJECTNAV --> FUNDING
        PROJECTNAV --> BETAINVITE
    end

    PROJECTROOM --> OVERVIEW
    OVERVIEW -. Watch introduction .-> MEDIA
    OVERVIEW -. View pitch deck .-> DECK
    OVERVIEW -. Follow project .-> NOTIFICATIONS
    OVERVIEW -. Join beta .-> BETAINVITE

    subgraph BETA[Beta participant experience]
        BETAACCEPT[Accept beta invitation]
        BETADETAIL[Beta overview and release notes]
        LAUNCH[Launch project]
        FEEDBACK[Submit feedback]
        CONFIRM[Feedback received]
        FEEDBACKSTATUS[View feedback status]

        BETAACCEPT --> BETADETAIL
        BETADETAIL --> LAUNCH
        LAUNCH --> FEEDBACK
        FEEDBACK --> CONFIRM
        CONFIRM --> FEEDBACKSTATUS
    end

    BETAINVITE -. Accept invitation .-> BETAACCEPT
    BETAS -. Open beta program .-> BETADETAIL
    BETADETAIL -. Launch beta .-> LAUNCH
    LAUNCH -. Report issue .-> FEEDBACK
    LAUNCH -. Share an idea .-> FEEDBACK
    CONFIRM -. View submission .-> FEEDBACKSTATUS

    subgraph ADMIN[Internal administration]
        ADMINNAV[Admin navigation<br/>Overview · People · Access Requests · Agreements · Projects · Content · Beta · Feedback · Nudge Queue · Audit]
        ADMINHOME[Admin overview]
        PEOPLE[People and roles]
        ACCESSREQUESTS[Access requests]
        AGREEMENTADMIN[Agreement templates]
        PROJECTADMIN[Project management]
        CONTENTADMIN[Protected content]
        BETAADMIN[Beta programs]
        FEEDBACKADMIN[Feedback inbox]
        NUDGES[Nudge queue]
        AUDIT[Audit trail]

        ADMINNAV --> ADMINHOME
        ADMINNAV --> PEOPLE
        ADMINNAV --> ACCESSREQUESTS
        ADMINNAV --> AGREEMENTADMIN
        ADMINNAV --> PROJECTADMIN
        ADMINNAV --> CONTENTADMIN
        ADMINNAV --> BETAADMIN
        ADMINNAV --> FEEDBACKADMIN
        ADMINNAV --> NUDGES
        ADMINNAV --> AUDIT
    end

    ACCESSREQUESTS -. Approve requester .-> WELCOME
    PROJECTADMIN -. Publish project .-> PROJECTS
    CONTENTADMIN -. Publish protected content .-> PROJECTROOM
    BETAADMIN -. Invite participants .-> BETAINVITE
    FEEDBACK -. Create submission .-> FEEDBACKADMIN
    DOCUSIGN -. Record agreement event .-> AUDIT
    PROJECTSIGN -. Record access grant .-> AUDIT
```

## Navigation menus

### Public navigation

- Home
- Venture
- Innovation
- Consulting
- Insights
- Contact
- Client Portal (lock icon; opens the sign-in route)
- Primary CTA: **Start a conversation**

The public logo and navigation remain fixed while a page scrolls. Desktop uses the full navigation; mobile uses a hamburger-triggered full-screen menu. Public pages do not use a footer.

### Member navigation

- Pulse
- Dashboard
- Projects
- Agreements
- Beta Programs
- Updates
- Notifications
- Profile and Security

### Project-room navigation

- Overview
- Media
- Deck
- Milestones
- Updates
- Funding
- Beta

### Admin navigation

- Overview
- People
- Access Requests
- Agreements
- Projects
- Content
- Beta
- Feedback
- Nudge Queue
- Audit

## Critical conversion paths

1. `Home → Request Access → Verify Email → Complete Account → Pending Approval → Approved → General NDA → Member Dashboard`
2. `Project Catalog → Project Overview → Project Access Request → Project Agreement → Protected Project Room`
3. `Project Room → Beta Invitation → Launch Product → Submit Feedback`

## Access boundary rule

Menus and CTAs may explain unavailable areas, but protected pages and resources must enforce authorization server-side. Hiding a link is not an access-control mechanism.
