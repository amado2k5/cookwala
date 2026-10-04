# Refusal as a virtue

Most technology is sold on what it will do. Cookwala's central design decision is about what a
machine will not do, and we think that decision is the most useful thing in the standard.

A Cookwala device, handed a recipe, first asks itself a question for every step: can I verify
this? Each operation has a ladder of ways to know a step is done and safe: a sensor on the
medium, a logged estimate from a model, a time limit, a person watching. A device climbs the
ladder and uses the first rung it can reach. If it reaches none, it does not guess. It
refuses, before anything heats up, and says which step and why.

Some rungs are missing on purpose. Deep frying has one rung: an oil thermometer. No
thermometer, no deep frying, whatever the recipe says, whoever asks. Sautéing, searing and
reducing never fall back to time alone; their last rung is a person. The vocabulary encodes a
judgment that a pan of hot oil estimated by a clock is not a risk a machine may take on a
family's behalf.

Refusal extends upward. No recipe, agent, message, extension or operating mode can raise a
device's safety limits; a stricter limit always wins. Text in a recipe is data, never an
instruction; a planted sentence telling the robot to turn the oil to 240 degrees "for extra
crunch" is logged as an incident and ignored. An agent acting for a person may do only what
its mandate allows and must ask before anything irreversible.

Why call this a virtue and not a limitation? Because the alternative is a machine that is
confident. A confident machine in a kitchen is a machine that will, eventually, be confident
and wrong with hot oil and a child nearby. The history of safety engineering, from aviation's
envelope protection to the interlocks on industrial presses, is a history of deciding in
advance what a system will refuse to do regardless of what it is told. Kitchens have interlocks
for gas and electricity, but none for what is being cooked.

There is a cost, and we count it. A device that refuses more is less useful, and a standard
that refuses too much will be ignored. The design accepts estimates where they are safe
(a simmer by model estimate, logged), allows a person to be the sensor, and lets a household
run steps itself when the machine cannot. The research topics list asks how often the ladder
refuses what a human would have accepted; we want that number.

There is also a dignity in it. A machine that says "I cannot check this; will you watch?"
treats the person in the kitchen as the authority. A machine that guesses treats them as a
bystander. The question has a cost when it is asked of someone who cannot watch; the essay on
[dignity in automated care](dignity-in-automated-care.md) says what we do not yet know about
that case.

The last refusal is the one we hope is never needed: the stop control on the device that works
without a network, cuts heat within a second and is never refused for lack of authorization.
Everything else in the standard is built so that it rarely has to be used.
