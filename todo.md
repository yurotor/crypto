Create a crypto rates display application, similar to "Trading View".
Find a free data source that can provide rates every X seconds (X is negotiatble, preferebly as small as a free API can get us).

User should enter app and see the chart for 24h for BTC (this is the default coin), with a top panel that dispaly the current rate in USD, the % change in last 24h (or any other selected time interval), the volume for the period, and the total supply.
The chart should display green/red colored area below it using the starting rate as the x axis (so everything above the starting rate for the period is green, everything else is red).
They could choose any other coin (start with just the 10 most popular by trading volume).
They can switch between time ranges from 24h,1w,1m,1y.
There should be a refresh button ro manually refresh the data but it should also refresh itself automticall every X seconds.

The UI should have themes that the user can switch between: standard (apple ui), retro (90s style), futuristic, and and a few more (use your imaginations, try to impress with some unpredicted themes).

Lets start by just having it as a website (later I would like to add macos/android mobile apps).

Guide me with questions about design decisions and implementation.
Create a CLAUDE.md and document what you're doing in it (keep it short and concise).
Import any skills that you need without asking for permissions.
Parellelize works wherever it makes sense using claude teams.

Use this repo https://github.com/yurotor/crypto.
You may push to it without asking for my permissions.