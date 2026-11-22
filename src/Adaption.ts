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
        if (!test) return null; // roll dialog closed without rolling
        await test.roll();
        const result = test.result ?? test.data.result;
        // the success levels are the result: > 0 successes, < 0 failures.
        // SL 0 is a marginal success (+0) or failure (-0), it must still count as one, wfrp4e tells which by the outcome.
        let sl = Number(result.baseSL) || 0;
        if (sl === 0) sl = result.outcome === "success" ? 1 : -1;
        const roll = await new Roll("1d100").roll();
        roll["_total"] = sl;
        return roll;
    }

    async actorRollAbility(actor, abilityId){
        return null
    }

    actorSheetAddTab(sheet, html, actor, tabData:{ id: string, label: string, html: string }, tabBody:string):void {
        // html can be stale or a fragment, the sheet element is the live root (wfrp4e >= 8 ApplicationV2 sheets)
        let root = $(html);
        if (root.find("nav.tabs").length === 0 && sheet?.element) root = $(sheet.element);
        root.find(".beavers-actor-tab").remove();
        const tabs = root.find("nav.tabs").first();
        if (tabs.length === 0) return;
        // wfrp4e >= 10 (ApplicationV2) only switches tabs for links with data-action="tab"
        const tabItem = $('<a class="item beavers-actor-tab" data-action="tab" data-group="primary" data-tab="' + tabData.id + '" title="' + tabData.label + '"></a>');
        tabItem.append($('<label></label>').text(tabData.label));
        tabs.append(tabItem);
        let body = root.find("section.content").first();
        if (body.length === 0) body = root.find(".window-content").first();
        const tabContent = $('<section style="overflow-y:auto" class="tab beavers-actor-tab" data-group="primary" data-tab="' + tabData.id + '"></section>');
        body.append(tabContent);
        tabContent.append(tabBody);
        // A re-render while our tab is selected falls back to the default tab, because the system does not know ours.
        if (typeof sheet?.changeTab === "function" && sheet.tabGroups?.primary === tabData.id) {
            sheet.changeTab(tabData.id, "primary", { force: true, updatePosition: false });
        }
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
        const header = content.find('header');
        const scrollAble = $('<div style="overflow-y:auto"></div>')
        content.empty();
        content.append(scrollAble);
        scrollAble.append(header);
        scrollAble.append(element);
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