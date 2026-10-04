# What a household robot may know

The founder's brainstorm for Cookwala ran for an hour and listed more than a hundred things a
cooking robot would need to know to do its job well: where the pots are, when the children
come home, who is diabetic, which medication must not meet grapefruit, whether the dog jumps,
who may open the door to a courier, whether the family is tight on money this month, when
they pray, how fast they eat, what they throw away.

He was right that a good cook knows these things. He was also describing one of the most intimate
dataset any device has ever held about a family, and the same facts are a burglar's plan
(who is away, which door), a profiler's dream (religion, health, income) and an insurer's
rating sheet (how they eat).

Cookwala's rule is simple to state: **the full picture stays home; only constraints travel.**
The planner in the house may know everything. A grocer learns "deliver between five and six to
the front door, label for peanuts"; it does not learn that a child has a severe allergy, that
the parents are out until half past five, or what the front door looks like. A delivery robot
learns "no movement in the hallway between three and half past three"; it does not learn why.

The rule is written as data, not as a promise. Each of the 139 facet types in the registry
carries a privacy class and a travel rule: 45 never leave the home in any form, 81 may leave
only as a derived constraint, 13 may leave as a disclosure after explicit consent, mostly the
robot's own state for its maker. A conformance test gives a recipient role and a set of facts
and expects the exact constraints and the exact refusals.

Four decisions in that registry deserve argument.

**Income is never inferred.** The founder's list had "is the family rich, moderate or poor".
We replaced it with a budget posture the owner sets. A machine that estimates a household's
wealth from its fridge is doing something no guest would be forgiven for.

**Children and absences are secret, even as constraints.** A delivery window is derived from
receiving rules, not from the schedule; the schedule itself produces only movement constraints
that reveal no times outside the house. We accept that this makes the robot slightly less
useful.

**Inferred facts never drive safety.** A robot may guess that the family likes mild food. It
may not guess that nobody is allergic.

**Behaviour is never scored.** The machine may notice that rice is always left over and cook
less. It may not keep a number that says how wasteful a person is.

The objections. A privacy rule inside a standard is only as good as the implementations, and
nobody audits a robot in a kitchen; our answer is conformance vectors and a certification
path, and the admission that both are weaker than law. Derived constraints can leak:
a sequence of delivery windows is a schedule; our answer is that this is an open research
problem (listed) and that the rule is a floor, not a ceiling. And consent in a household is
not one person's to give: the guest, the child, the housekeeper are in the data too. The
profile lets only an owner, an adult member or a guardian grant consent and says that
children cannot; it does not solve the guest.

The deeper question is whether a machine that knows a family this well should exist at all.
The founder's answer, and ours, is that these machines are being built, and that the choice is
between rules written in the open before they arrive and rules written by their makers after.
This document is the first kind.
