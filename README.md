# Danial Daily Greeting Widget

A minimal Notion greeting widget with:

- Time-based greeting
- Personalized name
- Current date
- One online random quote cached for the entire day
- Automatic light/dark theme adaptation
- Local fallback quotes when the quote API is unavailable

## Personalize the embed URL

Base URL:

`https://YOUR-USERNAME.github.io/REPOSITORY/`

Add your name:

`https://YOUR-USERNAME.github.io/REPOSITORY/?name=Danial`

Add a fixed timezone:

`https://YOUR-USERNAME.github.io/REPOSITORY/?name=Danial&tz=Europe/Berlin`

For Tehran:

`https://YOUR-USERNAME.github.io/REPOSITORY/?name=Danial&tz=Asia/Tehran`

You may also set a locale:

`?name=Danial&tz=Europe/Berlin&locale=en-US`

## Greeting periods

- Morning: 05:00–11:59
- Noon: 12:00–13:59
- Afternoon: 14:00–17:59
- Evening: 18:00–21:59
- Night: 22:00–04:59

## Quotes

The widget requests one random quote from DummyJSON and stores it in
`localStorage` for the current local date. It will not request a new quote
on every refresh.

If the remote API is unavailable or blocked, the widget selects one of its
built-in fallback quotes deterministically for that day.

## Embed in Notion

1. Type `/embed`.
2. Paste the personalized GitHub Pages URL.
3. Choose **Embed link**.
4. Resize to around 750–1000 px wide and 150–210 px high.
