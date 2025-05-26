import { Settings } from "./Settings.js";

export class Adaption implements SystemApi {

    get version() {
        return 1;
    }

    get id() {
        return "wfrp4e";
    }

    async actorRollSkill(actor, skillId){
        const skills = actor.items.filter(i=>i.type === "skill" && i.name.toLowerCase() === skillId.toLowerCase())
        if(!skills[0]){
            skills[0] = {id:"unknown",name:skillId}
        }
        const test = await actor.setupSkill(skills[0]);
        await test.roll();
        const roll = await new Roll("1d100").roll({async:false});
        roll["_total"] = test.data.result.baseSL;
        return roll;
    }

    async actorRollAbility(actor, abilityId){
        return null
    }

    actorSheetAddTab(sheet, html, actor, tabData:{ id: string, label: string, html: string }, tabBody:string):void {
        $(html).find(".beavers-crafting-actor-tab").remove();
        const tabs = $(html).find('nav.tabs');
        const tabItem = $('<a class="item beavers-crafting-actor-tab" data-group="primary" data-tab="' + tabData.id + '" title="' + tabData.label + '">'+tabData.label+'</a>');
        tabs.append(tabItem);
        let body = $(html).find("section.content");
        if(body.length === 0) body = $(html).find(".window-content");
        const tabContent = $('<div style="background-color:rgba(0,0,0,0.5)" class="tab beavers-crafting-actor-tab" data-group="primary" data-tab="' + tabData.id + '"></div>');
        body.append(tabContent);
        tabContent.append(tabBody);
    }

    itemSheetReplaceContent(app, html, element):void {
        if(html.find('.wfrp4e.item-sheet').length > 0){
            this.itemSheetReplaceContentLegacy(html,element);
        }else{
            this.itemSheetReplaceContentV2(html,element);
        }

    }
    itemSheetReplaceContentV2(html, element){
        const content = html.find('.window-content');
        const darkend = $("<div style='width:100%;height:100%;background-color:rgba(0,0,0,0.5)'></div>");
        const header = content.find('header');
        content.empty();
        content.append(darkend);
        darkend.append(header);
        darkend.append(element);
    }
    itemSheetReplaceContentLegacy( html, element){
        const sheetBody = html.find('.wfrp4e.item-sheet');
        const header = sheetBody.find('header');
        const img = sheetBody.find(".item-image");
        sheetBody.empty();
        const x = $("<div class='flexrow'></div>");
        sheetBody.append(x);
        x.append(img);
        x.append(header);
        sheetBody.append(element);
    }

    get configAbilities(){
        return [];
    }

    get configSkills():SkillConfig[] {
        let pack = game['packs'].get('wfrp4e.basic')
        if (! pack){
            pack = game['packs'].get('wfrp4e-core.items')
        }
        let skills:SkillConfig[] = [];
        if(pack){
            skills = pack
                .index.filter(f=>f.type==="skill").map(skill=>{
                return {
                    id: skill.name,
                    label: skill.name
                }
            });
        }
        Settings.get(Settings.SKILLS).split(",").forEach(skill=>{
            skills.push({id:skill.trim(),label:skill.trim()})
        });
        return skills;
    }


    get configCurrencies():CurrencyConfig[] {
        let pack = game['packs'].get('wfrp4e.basic')
        if (! pack){
            pack = game['packs'].get('wfrp4e-core.items')
        }
        return pack.index.filter(f=>f.type==="money").map(currency=>{
                let id = "bp";
                let factor = 1;
                if(currency.name === "Gold Crown"){
                    id = "gc";
                    factor = 240;
                }
                if(currency.name === "Silver Shilling"){
                    id = "ss";
                    factor = 12;
                }
                return {
                    id: id,
                    factor: factor,
                    label: currency.name,
                    uuid: currency.uuid
                }
            });
    }

    get configCanRollAbility():boolean {
        return false;
    }
    get configLootItemType(): string {
        return "trapping";
    }

    get itemPriceAttribute(): string {
        return "system.price";
    }

    get itemQuantityAttribute(): string {
        return "system.quantity.value";
    }
    async init(){

    }

}