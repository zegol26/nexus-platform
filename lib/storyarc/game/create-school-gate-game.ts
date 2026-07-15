import Phaser from "phaser";
import type { StoryArcBootstrap, StoryArcCommandResponse } from "./bridge";
import { isStoryArcPlayerAction, type StoryArcPlayerAction } from "./state";

type DialogueChoice = {
  id: string;
  text: string;
  nextNodeId: string;
  actionType: string;
  feedback: { message: string; modelUtterance: string };
};

type DialogueNode = {
  id: string;
  speakerId: string;
  text: string;
  expressionState: "neutral" | "warm" | "surprised" | "concerned";
  choices: DialogueChoice[];
};

type StoryScenePayload = {
  scene: {
    entryNodeId: string;
    dialogueNodes: DialogueNode[];
    hotspots: Array<{ id: string; label: string; actionType: string }>;
  };
};

type MountOptions = {
  parent: HTMLElement;
  bootstrap: StoryArcBootstrap;
  reducedMotion: boolean;
  onCommand: (action: StoryArcPlayerAction) => Promise<StoryArcCommandResponse>;
};

type HanaRig = {
  container: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Rectangle[];
  mouth: Phaser.GameObjects.Text;
  cheek: Phaser.GameObjects.Arc;
};

function scenePayload(bootstrap: StoryArcBootstrap) {
  return bootstrap.content.payload as StoryScenePayload;
}

class SchoolGateScene extends Phaser.Scene {
  private options: MountOptions;
  private sceneContent: StoryScenePayload["scene"];
  private hana?: HanaRig;
  private dialogueText?: Phaser.GameObjects.Text;
  private dialogueTimer?: Phaser.Time.TimerEvent;
  private choiceObjects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private activeChoices: DialogueChoice[] = [];
  private hotspotObjects: Array<Phaser.GameObjects.Arc | Phaser.GameObjects.Text> = [];
  private hotspotsVisible = false;
  private toastQueue: Array<{ message: string; color: number }> = [];
  private toastActive = false;
  private busy = false;

  constructor(options: MountOptions) {
    super("SchoolGate");
    this.options = options;
    this.sceneContent = scenePayload(options.bootstrap).scene;
  }

  create() {
    if (this.options.bootstrap.state.currentSceneId === "scene-courtyard-preview") {
      this.scene.start("CourtyardPreview");
      return;
    }
    this.drawEnvironment();
    this.hana = this.createHana();
    this.createDialoguePanel();
    this.createHotspots();
    this.input.keyboard?.on("keydown", this.handleKeyboardInput);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off("keydown", this.handleKeyboardInput));

    const choice = this.options.bootstrap.state.decisionState.introductionChoice;
    if (choice) {
      this.setHanaExpression(choice === "natural" ? "warm" : choice === "formal" ? "surprised" : "concerned");
      this.time.delayedCall(350, () => {
        this.typeDialogue("Hana", `Welcome back, ${this.options.bootstrap.player.name}. The gate is still open—tap a hotspot when you're ready.`);
        this.revealHotspots();
      });
    } else {
      const entry = this.node(this.sceneContent.entryNodeId);
      this.time.delayedCall(this.options.reducedMotion ? 80 : 700, () => this.showNode(entry));
    }
  }

  private drawEnvironment() {
    const sky = this.add.graphics();
    sky.fillStyle(0x9bd8e7).fillRect(0, 0, 960, 540);
    sky.fillStyle(0xffd6c7, 0.7).fillCircle(820, 90, 68);

    const far = this.add.container(0, 0);
    const hills = this.add.graphics();
    hills.fillStyle(0x5a8d86).fillEllipse(200, 330, 520, 230);
    hills.fillStyle(0x47766f).fillEllipse(760, 340, 620, 260);
    far.add(hills);

    const clouds = [
      this.cloud(120, 90, 0.7),
      this.cloud(520, 125, 0.5),
      this.cloud(780, 62, 0.35),
    ];
    if (!this.options.reducedMotion) {
      clouds.forEach((cloud, index) => this.tweens.add({ targets: cloud, x: cloud.x + 120, duration: 14000 + index * 3000, yoyo: true, repeat: -1, ease: "Sine.inOut" }));
    }

    const campus = this.add.container(0, 0);
    const building = this.add.graphics();
    building.fillStyle(0xf7efe2).fillRoundedRect(405, 155, 480, 260, 12);
    building.fillStyle(0x334f68).fillRect(405, 155, 480, 35);
    building.fillStyle(0xb8dbe4);
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 6; column += 1) building.fillRoundedRect(430 + column * 70, 220 + row * 60, 38, 28, 3);
    }
    campus.add(building);

    const gateLayer = this.add.container(0, 0);
    const gate = this.add.graphics();
    gate.fillStyle(0x1f3347).fillRoundedRect(330, 215, 26, 230, 5).fillRoundedRect(585, 215, 26, 230, 5);
    gate.fillStyle(0x20374b).fillRoundedRect(315, 205, 310, 35, 8);
    gate.fillStyle(0xf0c978).fillRoundedRect(375, 209, 190, 26, 5);
    gateLayer.add(gate);
    this.add.text(402, 214, "CAKRAWALA", { fontFamily: "Arial", fontSize: "15px", color: "#152a3b", fontStyle: "bold" });

    const foreground = this.add.container(0, 0);
    const trees = this.add.graphics();
    trees.fillStyle(0x173f3c).fillRect(0, 400, 960, 140);
    trees.fillStyle(0x2f6b56).fillCircle(75, 350, 90).fillCircle(900, 365, 110);
    trees.fillStyle(0x65a36f).fillCircle(145, 370, 65).fillCircle(840, 375, 60);
    foreground.add(trees);

    const flag = this.add.triangle(700, 190, 0, 0, 42, 12, 0, 24, 0xff6b7b).setOrigin(0, 0.5);
    this.add.rectangle(696, 220, 5, 95, 0x5b4535);
    if (!this.options.reducedMotion) this.tweens.add({ targets: flag, scaleX: 0.72, skewY: 0.08, duration: 700, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    if (!this.options.reducedMotion) {
      for (let index = 0; index < 12; index += 1) {
        const petal = this.add.ellipse(Phaser.Math.Between(0, 960), Phaser.Math.Between(-80, 420), 9, 5, 0xffb7c9, 0.8).setRotation(Math.random());
        this.tweens.add({
          targets: petal,
          x: `+=${Phaser.Math.Between(100, 240)}`,
          y: 590,
          angle: 260,
          duration: Phaser.Math.Between(6000, 10500),
          delay: Phaser.Math.Between(0, 3500),
          repeat: -1,
        });
      }
    }

    const pointerMove = (pointer: Phaser.Input.Pointer) => {
      if (this.options.reducedMotion) return;
      const offset = (pointer.x / 960 - 0.5) * 2;
      far.x = offset * -8;
      campus.x = offset * -14;
      gateLayer.x = offset * -20;
      foreground.x = offset * -28;
    };
    this.input.on("pointermove", pointerMove);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.off("pointermove", pointerMove));
  }

  private cloud(x: number, y: number, scale: number) {
    const cloud = this.add.container(x, y).setScale(scale);
    cloud.add([
      this.add.ellipse(0, 0, 110, 38, 0xffffff, 0.68),
      this.add.circle(-28, -14, 26, 0xffffff, 0.68),
      this.add.circle(18, -18, 33, 0xffffff, 0.68),
    ]);
    return cloud;
  }

  private createHana(): HanaRig {
    const container = this.add.container(1080, 310);
    const body = this.add.graphics();
    body.fillStyle(0x253a58).fillRoundedRect(-72, 25, 144, 210, 35);
    body.fillStyle(0xffffff).fillTriangle(-25, 25, 25, 25, 0, 95);
    body.fillStyle(0xd45b74).fillTriangle(-12, 40, 12, 40, 0, 92);
    const head = this.add.ellipse(0, -48, 132, 150, 0xffd1b8);
    const hairBack = this.add.ellipse(0, -63, 156, 178, 0x382c3f);
    const hairFront = this.add.graphics();
    hairFront.fillStyle(0x382c3f).fillTriangle(-68, -90, 30, -132, -8, -58).fillTriangle(5, -130, 70, -82, 28, -58);
    const eyeLeft = this.add.rectangle(-25, -44, 18, 5, 0x2c2531);
    const eyeRight = this.add.rectangle(25, -44, 18, 5, 0x2c2531);
    const mouth = this.add.text(0, -16, "⌣", { fontFamily: "Arial", fontSize: "25px", color: "#a44b5f" }).setOrigin(0.5);
    const cheek = this.add.arc(0, -12, 52, 15, 165, false, 0xff819a, 0.2);
    container.add([hairBack, head, body, hairFront, eyeLeft, eyeRight, cheek, mouth]);
    container.setDepth(12);

    if (this.options.reducedMotion) container.x = 755;
    else {
      this.tweens.add({ targets: container, x: 755, duration: 720, ease: "Back.out" });
      this.tweens.add({ targets: container, y: 304, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      this.tweens.add({ targets: body, scaleY: 1.025, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      this.time.addEvent({
        delay: 2700,
        loop: true,
        callback: () => {
          eyeLeft.setVisible(false); eyeRight.setVisible(false);
          this.time.delayedCall(110, () => { eyeLeft.setVisible(true); eyeRight.setVisible(true); });
        },
      });
    }
    return { container, eyes: [eyeLeft, eyeRight], mouth, cheek };
  }

  private setHanaExpression(expression: DialogueNode["expressionState"]) {
    if (!this.hana) return;
    if (expression === "surprised") {
      this.hana.mouth.setText("○").setFontSize(18);
      this.hana.eyes.forEach((eye) => eye.setSize(13, 11));
      this.hana.cheek.setAlpha(0);
    } else if (expression === "concerned") {
      this.hana.mouth.setText("﹏").setFontSize(18);
      this.hana.eyes.forEach((eye) => eye.setSize(17, 4));
      this.hana.cheek.setAlpha(0.1);
    } else {
      this.hana.mouth.setText("⌣").setFontSize(25);
      this.hana.eyes.forEach((eye) => eye.setSize(18, 5));
      this.hana.cheek.setAlpha(expression === "warm" ? 0.35 : 0.2);
    }
  }

  private createDialoguePanel() {
    const panel = this.add.graphics().setDepth(30);
    panel.fillStyle(0x071827, 0.95).fillRoundedRect(25, 345, 910, 175, 18);
    panel.lineStyle(2, 0x7fe8ed, 0.35).strokeRoundedRect(25, 345, 910, 175, 18);
    this.dialogueText = this.add.text(58, 370, "", {
      fontFamily: "Arial",
      fontSize: "21px",
      color: "#eefcff",
      wordWrap: { width: 830 },
      lineSpacing: 6,
    }).setDepth(31);
  }

  private typeDialogue(speaker: string, text: string, onComplete?: () => void) {
    this.dialogueTimer?.remove(false);
    if (!this.dialogueText) return;
    const full = `${speaker.toUpperCase()}  ·  ${text}`;
    if (this.options.reducedMotion) {
      this.dialogueText.setText(full);
      onComplete?.();
      return;
    }
    let index = 0;
    this.dialogueText.setText("");
    this.dialogueTimer = this.time.addEvent({
      delay: 20,
      repeat: full.length - 1,
      callback: () => {
        index += 1;
        this.dialogueText?.setText(full.slice(0, index));
        if (index === full.length) onComplete?.();
      },
    });
  }

  private showNode(node: DialogueNode) {
    this.setHanaExpression(node.expressionState);
    this.typeDialogue(node.speakerId === "char-hana" ? "Hana" : this.options.bootstrap.player.name, node.text, () => {
      if (node.choices.length > 0) this.showChoices(node.choices);
    });
  }

  private showChoices(choices: DialogueChoice[]) {
    this.clearChoices();
    this.activeChoices = choices;
    this.dialogueText?.setFontSize(17).setY(359);
    choices.forEach((choice, index) => {
      const y = 405 + index * 36;
      const background = this.add.rectangle(480, y, 835, 30, 0x14344a, 0.96).setStrokeStyle(1, 0x7fe8ed, 0.35).setDepth(32).setInteractive({ useHandCursor: true });
      const label = this.add.text(75, y, `${index + 1}. ${choice.text}`, { fontFamily: "Arial", fontSize: "14px", color: "#f1fcff" }).setOrigin(0, 0.5).setDepth(33);
      background.setAlpha(0).setScale(0.96);
      label.setAlpha(0);
      const duration = this.options.reducedMotion ? 0 : 240;
      this.tweens.add({ targets: [background, label], alpha: 1, duration, delay: index * 80 });
      this.tweens.add({ targets: background, scaleX: 1, scaleY: 1, duration, delay: index * 80, ease: "Back.out" });
      background.on("pointerover", () => background.setFillStyle(0x1c5264, 1));
      background.on("pointerout", () => background.setFillStyle(0x14344a, 0.96));
      background.on("pointerdown", () => void this.choose(choice));
      this.choiceObjects.push(background, label);
    });
  }

  private async choose(choice: DialogueChoice) {
    if (this.busy || !isStoryArcPlayerAction(choice.actionType)) return;
    this.busy = true;
    this.choiceObjects.forEach((object) => object.setAlpha(0.45));
    try {
      const result = await this.options.onCommand(choice.actionType);
      if (!this.options.reducedMotion) this.cameras.main.shake(170, 0.004);
      const reaction = this.node(choice.nextNodeId);
      this.setHanaExpression(reaction.expressionState);
      this.clearChoices();
      this.dialogueText?.setFontSize(20).setY(365);
      this.typeDialogue("Hana", reaction.text);
      this.toast(choice.feedback.message, 0x183d52);
      result.displayEvents.forEach((event, index) => this.time.delayedCall(550 + index * 550, () => this.toast(event.label, event.type === "EXPRESSION_UNLOCK" ? 0x6b325f : 0x12524e)));
      this.time.delayedCall(900, () => this.revealHotspots());
    } catch (error) {
      this.choiceObjects.forEach((object) => object.setAlpha(1));
      this.toast(error instanceof Error ? error.message : "Save failed. Please retry.", 0x71333c);
    } finally {
      this.busy = false;
    }
  }

  private createHotspots() {
    const signHotspot = this.add.circle(245, 290, 29, 0xffd66e, 0.1).setStrokeStyle(2, 0xffe8a3, 0.7).setDepth(20).setVisible(false);
    const gateHotspot = this.add.circle(475, 280, 37, 0x7fe8ed, 0.1).setStrokeStyle(2, 0x7fe8ed, 0.75).setDepth(20).setVisible(false);
    const signLabel = this.add.text(115, 245, "[S] Bridge Club notice", { fontFamily: "Arial", fontSize: "14px", color: "#1a2530", backgroundColor: "#ffe7a2", padding: { x: 10, y: 6 } }).setDepth(21).setVisible(false);
    const gateLabel = this.add.text(415, 235, "[Enter] Enter campus", { fontFamily: "Arial", fontSize: "14px", color: "#09232c", backgroundColor: "#9bf4f1", padding: { x: 10, y: 6 } }).setDepth(21).setVisible(false);
    this.hotspotObjects.push(signHotspot, gateHotspot, signLabel, gateLabel);

    signHotspot.setInteractive({ useHandCursor: true }).on("pointerdown", () => void this.hotspot("inspect-school-sign"));
    gateHotspot.setInteractive({ useHandCursor: true }).on("pointerdown", () => void this.hotspot("enter-school"));
    if (!this.options.reducedMotion) this.tweens.add({ targets: [signHotspot, gateHotspot], alpha: 0.85, scale: 1.14, duration: 750, yoyo: true, repeat: -1 });
  }

  private revealHotspots() {
    this.hotspotsVisible = true;
    this.hotspotObjects.forEach((object, index) => {
      object.setVisible(true).setAlpha(0);
      this.tweens.add({ targets: object, alpha: 1, duration: this.options.reducedMotion ? 0 : 260, delay: index * 60 });
    });
  }

  private async hotspot(action: StoryArcPlayerAction) {
    if (this.busy) return;
    this.busy = true;
    try {
      const result = await this.options.onCommand(action);
      result.displayEvents.forEach((event, index) => this.time.delayedCall(index * 420, () => this.toast(event.label, 0x12524e)));
      if (action === "enter-school") {
        this.hotspotsVisible = false;
        this.cameras.main.fadeOut(this.options.reducedMotion ? 0 : 650, 5, 18, 29);
        this.time.delayedCall(this.options.reducedMotion ? 40 : 700, () => this.scene.start("CourtyardPreview"));
      } else if (!this.options.reducedMotion) {
        this.cameras.main.zoomTo(1.025, 180, Phaser.Math.Easing.Sine.InOut, true);
        this.time.delayedCall(220, () => this.cameras.main.zoomTo(1, 180, Phaser.Math.Easing.Sine.InOut, true));
      }
    } catch (error) {
      this.toast(error instanceof Error ? error.message : "Save failed. Please retry.", 0x71333c);
    } finally {
      this.busy = false;
    }
  }

  private toast(message: string, color: number) {
    this.toastQueue.push({ message, color });
    this.showNextToast();
  }

  private showNextToast() {
    if (this.toastActive) return;
    const next = this.toastQueue.shift();
    if (!next) return;
    this.toastActive = true;

    const box = this.add.rectangle(310, 58, 560, 45, next.color, 0.95).setStrokeStyle(1, 0xffffff, 0.25).setDepth(80).setAlpha(0);
    const label = this.add.text(42, 58, next.message, { fontFamily: "Arial", fontSize: "15px", color: "#ffffff", wordWrap: { width: 520 } }).setOrigin(0, 0.5).setDepth(81).setAlpha(0);
    this.tweens.add({
      targets: [box, label],
      alpha: 1,
      y: "+=10",
      duration: this.options.reducedMotion ? 0 : 180,
      hold: 2100,
      yoyo: true,
      onComplete: () => {
        box.destroy();
        label.destroy();
        this.toastActive = false;
        this.showNextToast();
      },
    });
  }

  private node(id: string) {
    const node = this.sceneContent.dialogueNodes.find((candidate) => candidate.id === id);
    if (!node) throw new Error(`Published dialogue node ${id} is missing.`);
    return node;
  }

  private clearChoices() {
    this.choiceObjects.forEach((object) => object.destroy());
    this.choiceObjects = [];
    this.activeChoices = [];
  }

  private handleKeyboardInput = (event: KeyboardEvent) => {
    if (this.busy) return;
    const choiceIndex = ["Digit1", "Digit2", "Digit3"].indexOf(event.code);
    if (choiceIndex >= 0 && this.activeChoices[choiceIndex]) {
      event.preventDefault();
      void this.choose(this.activeChoices[choiceIndex]);
      return;
    }
    if (!this.hotspotsVisible) return;
    if (event.code === "KeyS") {
      event.preventDefault();
      void this.hotspot("inspect-school-sign");
    } else if (event.code === "Enter") {
      event.preventDefault();
      void this.hotspot("enter-school");
    }
  };
}

class CourtyardPreviewScene extends Phaser.Scene {
  private options: MountOptions;

  constructor(options: MountOptions) {
    super("CourtyardPreview");
    this.options = options;
  }

  create() {
    const background = this.add.graphics();
    background.fillStyle(0x0b2736).fillRect(0, 0, 960, 540);
    background.fillStyle(0x154b5a).fillCircle(780, 130, 190);
    background.fillStyle(0x1d6070).fillCircle(190, 490, 260);
    this.add.text(480, 185, "COURTYARD CHECKPOINT", { fontFamily: "Arial", fontSize: "16px", color: "#7fe8ed", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(480, 245, "The gate closes softly behind you.", { fontFamily: "Arial", fontSize: "32px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(480, 305, "Phase A scene transition complete. Refreshing this page resumes here from authoritative server state.", { fontFamily: "Arial", fontSize: "17px", color: "#c4dbe2", align: "center", wordWrap: { width: 660 } }).setOrigin(0.5);
    const pulse = this.add.circle(480, 400, 9, 0x7fe8ed, 0.8);
    if (!this.options.reducedMotion) this.tweens.add({ targets: pulse, scale: 2.2, alpha: 0.15, duration: 1100, yoyo: true, repeat: -1 });
    this.cameras.main.fadeIn(this.options.reducedMotion ? 0 : 650, 5, 18, 29);
  }
}

export function mountSchoolGateGame(options: MountOptions) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: 960,
    height: 540,
    backgroundColor: "#06111c",
    render: { antialias: true, pixelArt: false, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new SchoolGateScene(options), new CourtyardPreviewScene(options)],
    input: { activePointers: 2 },
  });

  const visibility = () => {
    if (document.hidden) game.loop.sleep();
    else game.loop.wake();
  };
  document.addEventListener("visibilitychange", visibility);
  return {
    destroy() {
      document.removeEventListener("visibilitychange", visibility);
      game.destroy(true);
    },
  };
}
