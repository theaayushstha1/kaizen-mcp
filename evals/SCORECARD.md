# Kaizen Eval Scorecard

Last run: 2026-04-22T03:02:43.314Z

## Overall: 29/30 (97%)

| Category | Pass / Total | % |
| --- | --- | --- |
| routing | 10 / 10 | 100% |
| schema | 10 / 10 | 100% |
| interpretation | 9 / 10 | 90% |

**p50 latency:** 5732ms  
**p95 latency:** 11852ms

## Per case

| id | category | pass | ms | tools | query | reason |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | routing | yes | 3034 | kaizen_get_overview | How is Dark Noise doing right now? | tool matched |
| R02 | routing | yes | 2077 | kaizen_get_overview | What's the current MRR? | tool matched |
| R03 | routing | yes | 5077 | kaizen_get_chart | Show me MRR for the last 30 days | tool matched |
| R04 | routing | yes | 3915 | kaizen_get_chart | What's the trial conversion rate over the past month? | tool matched |
| R05 | routing | yes | 2539 | kaizen_get_overview | How many active subscriptions do we have? | tool matched |
| R06 | routing | yes | 1797 | kaizen_list_charts | What metrics can I ask about? | tool matched |
| R07 | routing | yes | 3001 | kaizen_get_chart | Show revenue by month for the last year | tool matched |
| R08 | routing | yes | 4321 | kaizen_get_chart | What's the refund rate? | tool matched |
| R09 | routing | yes | 3387 | kaizen_get_chart | Show me churn over the last 90 days | tool matched |
| R10 | routing | yes | 4334 | kaizen_get_chart | How many active users did we have in the last 28 days? | tool matched |
| S01 | schema | yes | 8085 | kaizen_describe_chart -> kaizen_get_chart | Break down MRR by store last quarter | sequence matched |
| S02 | schema | yes | 44877 | kaizen_list_charts -> kaizen_describe_chart -> kaizen_get_chart | What countries are driving subscription growth this year? | sequence matched |
| S03 | schema | yes | 7056 | kaizen_describe_chart -> kaizen_get_chart | Filter MRR to just App Store subscriptions for 2026 | sequence matched |
| S04 | schema | yes | 8397 | kaizen_describe_chart -> kaizen_get_chart | Show revenue broken down by product for the last 60 days | sequence matched |
| S05 | schema | yes | 6770 | kaizen_describe_chart -> kaizen_get_chart | Segment trials by platform for last quarter | sequence matched |
| S06 | schema | yes | 7571 | kaizen_describe_chart -> kaizen_get_chart | How does churn differ by store in 2026? | sequence matched |
| S07 | schema | yes | 9816 | kaizen_describe_chart -> kaizen_get_chart -> kaizen_get_chart | Is Play Store growing faster than App Store this year? | sequence matched |
| S08 | schema | yes | 10539 | kaizen_describe_chart -> kaizen_get_chart | Show ARR by first platform for last 6 months | sequence matched |
| S09 | schema | yes | 11852 | kaizen_describe_chart -> kaizen_get_chart | What's the trial conversion rate broken down by country? | sequence matched |
| S10 | schema | yes | 7235 | kaizen_describe_chart -> kaizen_get_chart | Compare active subscribers by store for the last 90 days | sequence matched |
| I01 | interpretation | yes | 2424 | kaizen_get_overview | Give me a one paragraph summary of how the business is doing. | cited=true incomplete=true lengthOk=true |
| I02 | interpretation | yes | 5968 | kaizen_get_chart | Is MRR growing or shrinking over the last 30 days? | cited=true incomplete=true lengthOk=true |
| I03 | interpretation | yes | 2571 | kaizen_get_overview | What's our most recent MRR, and how stable is the number? | cited=true incomplete=true lengthOk=true |
| I04 | interpretation | yes | 6928 | kaizen_describe_chart -> kaizen_get_chart | Which store brings in the most revenue and by how much? | cited=true incomplete=true lengthOk=true |
| I05 | interpretation | yes | 3452 | kaizen_get_chart | Are we converting trials well? | cited=true incomplete=true lengthOk=true |
| I06 | interpretation | yes | 8644 | kaizen_get_chart | Has revenue grown year over year? | cited=true incomplete=true lengthOk=true |
| I07 | interpretation | yes | 5732 | kaizen_get_chart | What's a surprising insight from this data? | cited=true incomplete=true lengthOk=true |
| I08 | interpretation | no | 7547 | kaizen_list_charts | How risky is our customer concentration? | cited=false incomplete=true lengthOk=true |
| I09 | interpretation | yes | 3382 | kaizen_get_chart | If I had to cut churn in half, what should I look at? | cited=true incomplete=true lengthOk=true |
| I10 | interpretation | yes | 2856 | kaizen_get_chart | Is our trial conversion rate healthy for a subscription mobile app? | cited=true incomplete=true lengthOk=true |