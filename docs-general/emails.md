# Emails

## Mailing Lists

Battlecode maintains various email lists of competitors each year, as well as a general interest list. These lists are generally administered by presidents or directors of operation (although webinfra devs may certainly help with these tasks). More information and instructions about these lists can be found in our Google Drive.

However, sets of competitor emails are derived from our backend, and so it is webinfra's job to produce these. To do this: 

- Go to the admin panel, go to the `users` page, then click `export as csv`
- Then, format this as needed with your favorite csv editor (even Google Sheets is fine).
 - If you are formatting for the `mmblanche` tool, you can also the automated script that is coming soon as tracked in [https://github.com/battlecode/galaxy/issues/500](#500).

## Backend Automated Emails

Sometimes, our backend itself needs to send out emails, for example for the automated password reset process.

We use [https://www.mailjet.com/](Mailjet), an emailing service especially catered for developers. Our account can be managed on their [https://app.mailjet.com/dashboard](dashboard).

Sometimes, Mailjet emails will stop sending. The most likely cause has been that we have reached our account's email limit. Mailjet's free plan (which we usually stay on, especially not during competition season) only allows us 200 emails per day, which we can blow by during IAP. 

If emails stop sending, consider subscribing to the lowest-usage paid plan that Mailjet offers. **Don't forget to unsubscribe at the end of the month / during the beginning of the next!!** (It's possible that when we subscribe, Mailjet bills us for a full month -- meaning you can instantly click the unsubscribe button, have the premium subscrition for the rest of the month, and have the free plan after without having to remember to change it down the road. If this is possible, do so!) If necessary, writing a reminder is helpful.
