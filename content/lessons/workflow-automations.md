# Workflow Automations

Skill level: Level 6

Learning objective: Build simple, testable GoHighLevel workflows using triggers, actions, wait steps, conditions, if/else branches, tags, pipeline updates, internal notifications, appointment reminders, missed-call text-back, and re-engagement logic.

## Plain-English Explanation

A workflow is a set of instructions that runs when something happens. In GHL, the "something" is usually a trigger, such as a form submission, appointment booked, tag added, pipeline stage changed, or missed call. The workflow then performs actions, such as sending an SMS, adding a tag, creating a task, moving an opportunity, waiting one day, or notifying a team member.

The goal is not to automate everything. The goal is to make the next correct action happen reliably.

## Key Terms

- Workflow: A rule-based automation that starts from a trigger and runs actions.
- Trigger: The event that starts the workflow. Examples: Form Submitted, Tag Added, Appointment Booked, Customer Replied, Missed Call.
- Action: Something the workflow does. Examples: Send SMS, Send Email, Add Tag, Create Task, Move Opportunity, Notify User.
- Wait step: A delay before the next action, such as wait one day or wait until appointment time.
- Condition: A rule that checks if something is true. Example: Does the contact have an appointment?
- If/else branch: A split path. If the condition is true, do one thing. If not, do another.
- Internal notification: A message to the business team, not the lead.
- Stop rule: A rule that removes or stops a contact from the workflow when they reply, book, buy, cancel, or no longer qualify.
- Re-engagement: A workflow that follows up with old or inactive leads.

## Step-by-Step Instructions

1. Write the business goal before touching the workflow builder.
2. Choose one clear trigger, such as Form Submitted, Appointment Booked, Tag Added, or Customer Replied.
3. Add only the actions needed for the first result.
4. Use wait steps when timing matters, such as reminders or lead nurture.
5. Use if/else conditions when different leads need different paths.
6. Add internal notifications when a human must act.
7. Add exit or stop rules so leads do not receive the wrong messages.
8. Test with a fake contact before launching.

## Example Client Situation

A pet grooming shop wants faster follow-up. A new lead submits a grooming form. The workflow adds the tag New Grooming Lead, creates an opportunity in the Grooming Pipeline, sends an SMS asking the lead to book, waits one day, checks if an appointment exists, and sends a reminder only if the lead has not booked.

## Common Mistakes

- Building a workflow before defining the client process.
- Using too many triggers in one workflow.
- Forgetting to stop messages after the lead replies or books.
- Sending SMS before confirming consent and business rules.
- Not testing every branch with a fake contact.
- Updating pipeline stages automatically when human review is needed.

## Practice Task

Design a simple missed-call text-back workflow for a dental clinic. Include the trigger, three actions, one wait step, one condition, and one internal notification.

## Easy Practice Version

Use this starter workflow:

1. Trigger: Missed call.
2. Action: Send SMS asking how the clinic can help.
3. Action: Add tag Missed Call Lead.
4. Action: Notify front desk.
5. Wait: 10 minutes.
6. Condition: Did the lead reply?
7. Stop rule: Stop nurture when the lead replies or books.

Then explain how you would test it with a fake contact.

## Hirable Completion Standard

You meet the hire-ready expectation for this level when you can:

- Identify one clear trigger.
- Add only the actions needed for the business goal.
- Use waits and if/else branches without making the workflow confusing.
- Add staff notification when a human must act.
- Add stop rules so leads do not receive the wrong messages.
- Test every branch with fake data before launch.

## Quick Quiz

Question: Why should a workflow have stop or exit rules?

Expected answer: To prevent leads from receiving irrelevant or annoying messages after they reply, book, buy, or no longer match the workflow conditions.

## Hire-Ready Skill Note

Workflow building is one of the most hireable GHL skills. Clients care about speed-to-lead, fewer no-shows, better follow-up, and cleaner handoff to staff. A beginner who can build and test simple workflows carefully can already create business value.
