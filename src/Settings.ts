export class Settings {

    static NAMESPACE = "bsa-wfrp4e";
    public static SKILLS = "skills";
    public static ALLOW_CRITICAL = "allowCritical";

    static init() {
        game["settings"].register(this.NAMESPACE, this.SKILLS, {
            name: "Additional Skills",
            hint: "coma seperated list of skill names.",
            scope: "world",
            config: true,
            default: "",
            requiresReload: true,
            type: String,
        });
        game["settings"].register(this.NAMESPACE, this.ALLOW_CRITICAL, {
            name: "Allow critical rolls",
            hint: "Allow critical success and failures e.g. one roll can produce multiple fails or success",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
        });
    }

    static get(key) {
        return game["settings"].get(this.NAMESPACE, key);
    };

    static set(key, value) {
        game["settings"].set(this.NAMESPACE, key, value);
    }

}