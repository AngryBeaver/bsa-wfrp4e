import {Settings} from "./Settings.js";

class SkillTest implements TestClass<"skill"> {
    public type:string =  "SkillTest"
    _choices:{[key:string]:{text:string, img?:string}} = {};
    constructor(){
        this._choices = beaversSystemInterface.configSkills.reduce((object, skill) => {
            object[skill.id] = { text: skill.label };
            return object;
        }, {})
    }
    public create(data:Record<"skill",any>){
        const result = new SkillTestCustomized();
        result.data = data;
        result.parent = this;
        return result;
    }
    public informationField:InfoField = {
        name: "type",
        type: "info",
        label: game['i18n'].localize("beaversSystemInterface.tests.skillTest.info.label"),
        note: game['i18n'].localize("beaversSystemInterface.tests.skillTest.info.note")
    }

    get customizationFields(): Record<"skill",InputField>{
        return {
            skill: {
                name: "skill",
                label: "skill",
                note: "Skill",
                type: "selection",
                choices: this._choices
            },
        };
    }

}

class SkillTestCustomized implements Test<"skill"> {

    parent: SkillTest
    data:{skill:string}={skill:""}

    public action = async (initiatorData: InitiatorData):Promise<TestResult> => {
        const actor = beaversSystemInterface.initiator(initiatorData).actor;
        const roll = await beaversSystemInterface.actorRollSkill(actor,this.data.skill);
        let success = roll.total
        if(!Settings.get(Settings.ALLOW_CRITICAL)){
            success = Math.max(-1,Math.min(1,roll.total));
        }
        return {
            success:success>0?success:0,
            fail: success>0?0:-success
        }
    }

    public render = (): string => {
        const skill = this.parent._choices[this.data.skill]?.text||"process";
        return `Skill: ${skill}`;
    };

}

beaversSystemInterface.registerTestClass(new SkillTest());