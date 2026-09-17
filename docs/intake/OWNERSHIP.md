# Who owns what on Miramar's assistant and QR cards

Recorded 2026-09-15, from Kazim.

**Gürkan owns the QR card generator and the AI phone assistant.** He is a close friend of Kazim's,
based in Belgium, and Kazim has given him both pieces of work. The code and the repositories that
produce the printed vendor cards and run the assistant live with him; K13 gets access soon. Kazim
wants him on these components, and bringing him into the K13 team is on the table.

**So: do not rebuild either of them here.** A session looking only at this machine will find no
generator for `Miramar_Food_Hall_QR_Cards.pdf` and no assistant code, and may conclude the source
was lost in a one-off script. It was not. Ask Kazim for Gürkan's repos rather than writing a second
implementation.

**What K13 owns in this folder** is the intake questionnaire,
`Miramar_AI_Assistant_Intake_Form.html`: the thing Lorena fills in. Its exported answers are the
input to Gürkan's fine-tuning, and the vendor menu, website and review links it collects are what
the cards are printed from. That makes the export format a shared interface: if it changes shape,
it is worth telling him.

## The assistant's live number

**(949) 868-4030.** Recorded 2026-09-16. The assistant answers on this line today as a proof of
concept: it picks up, and it answers thinly, because the questionnaire has not been filled in yet.
This is the number Tiger were told to call in the 2026-09-16 sign-off email, so it is now a client
facing fact, not an internal note.

Miramar's own published line, **(951) 970-6693**, is commented out of `website/index.html` and has
been since the call volume became unmanageable. Whether it forwards to the assistant is the one
phone question still open with the client; the questionnaire asks it, and the email asks it.
