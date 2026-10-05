package ai.cookwala.samples;

/** A person in the kitchen, as agents and recovery see one. */
public interface Human {
    /** Is the person in the kitchen? */
    boolean present();

    /** Ask the person to confirm an item (such as {@code diet_or_allergen_change}). */
    boolean confirm(String item, String detail);

    /** Ask the person to attend an execution that needs a human. */
    boolean attend(String executionId, String why);
}
