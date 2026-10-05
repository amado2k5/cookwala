package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiPredicate;

/** A person for demos and tests: answers from a script, records every interaction. */
public class ScriptedHuman implements Human {
    private final boolean present;
    private final BiPredicate<String, String> confirm;
    private final BiPredicate<String, String> attend;
    /** Every interaction: {kind: confirm|attend, ..., answer}. */
    public final List<Map<String, Object>> log = new ArrayList<>();

    public ScriptedHuman(boolean present, BiPredicate<String, String> confirm, BiPredicate<String, String> attend) {
        this.present = present;
        this.confirm = confirm;
        this.attend = attend;
    }

    public ScriptedHuman(boolean present, boolean confirm, boolean attend) {
        this(present, (a, b) -> confirm, (a, b) -> attend);
    }

    /** Present, says yes to everything. */
    public ScriptedHuman() { this(true, true, true); }

    public ScriptedHuman(boolean present) { this(present, true, true); }

    @Override public boolean present() { return present; }

    @Override
    public boolean confirm(String item, String detail) {
        boolean ok = confirm.test(item, detail);
        log.add(Py.map("kind", "confirm", "item", item, "detail", detail, "answer", ok));
        return ok;
    }

    @Override
    public boolean attend(String executionId, String why) {
        boolean ok = present && attend.test(executionId, why);
        log.add(Py.map("kind", "attend", "execution", executionId, "why", why, "answer", ok));
        return ok;
    }
}
