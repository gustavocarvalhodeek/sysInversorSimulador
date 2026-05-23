import { DEFAULT_LANGUAGE, resolveLanguageCode } from "../i18n/languages.js";

function data(label, value, unit = "") {
  return { label, value, unit };
}

function state(name, description) {
  return { name, description };
}

export const COMPONENT_LIBRARY_TRANSLATIONS = {
  "en-US": {
    cfw100: {
      name: "WEG CFW100 Drive",
      description:
        "Didactic drive with full HMI, parameter, motor, and protection simulation.",
      functionDescription:
        "Controls motor speed through frequency variation, ramps, reference selection, and command logic.",
      operatingPrinciple:
        "Rectifies the input, builds a DC bus, and synthesizes a PWM AC output with variable frequency for the motor.",
      typicalApplications: [
        "Didactic benches for electric drives.",
        "Pumps, fans, and conveyors with variable speed.",
      ],
      mainData: [
        data("Typical input voltage", "220", "Vac"),
        data("Output frequency", "0 to 66", "Hz"),
        data("Didactic modes", "HMI, presets, faults, motor", ""),
        data("Current project state", "Main simulator open", ""),
      ],
      visualStates: [
        state("Ready", "Drive energized and ready to start."),
        state("Run", "Active output with frequency applied to the motor."),
        state("Fault", "Protection active with a fault code on the display."),
      ],
      chartTitle: "Frequency ramp",
      chartDescription:
        "Didactic curve of the output frequency during a controlled acceleration.",
      limitations: [
        "The library does not replace the current simulator; the CFW100 remains on the main screen.",
        "These library details summarize the existing module without duplicating the full HMI here.",
      ],
    },
    "soft-starter": {
      shortName: "Soft starter",
      description:
        "Electronic soft starting to reduce current peaks and mechanical impact.",
      functionDescription:
        "Limits the voltage applied to the motor during startup and, in many cases, during soft stopping.",
      operatingPrinciple:
        "Controls the firing angle of thyristors to gradually raise the effective voltage on the motor.",
      typicalApplications: [
        "Pumps and fans that require smooth startup.",
        "Conveyors with reduced mechanical shock.",
      ],
      mainData: [
        data("Main variable", "Starting effective voltage", ""),
        data("Expected behavior", "Reduced starting current", ""),
        data("Power element", "Antiparallel thyristors", ""),
      ],
      visualStates: [
        state("Ready", "Equipment powered and waiting for a command."),
        state("Starting ramp", "Voltage rises progressively at the motor."),
        state("Bypass", "Motor in steady state with a stabilized power path."),
      ],
      chartTitle: "Smoothed starting current",
      chartDescription:
        "Conceptual representation of reduced current during soft starting.",
      tags: ["starting", "thyristor", "current"],
      limitations: [
        "This component does not yet have interactive simulation.",
        "The displayed curve is only didactic and does not replace the manufacturer's datasheet.",
      ],
    },
    "generic-vfd": {
      name: "Generic frequency drive",
      shortName: "Generic VFD",
      description:
        "Conceptual representation of a frequency drive outside the CFW100 model.",
      functionDescription:
        "Allows study of the VFD role in torque, speed, and acceleration ramp control.",
      operatingPrinciple:
        "Uses power electronics to convert fixed energy into output controlled by frequency and voltage.",
      typicalApplications: [
        "Didactic comparison between drive families.",
        "Introduction to scalar and vector control.",
      ],
      mainData: [
        data("Control variable", "Output frequency", "Hz"),
        data("Common topology", "Rectifier + DC bus + PWM inverter", ""),
        data("Simulation levels", "Informational only at this stage", ""),
      ],
      visualStates: [
        state("Off", "No power supply or no power enable."),
        state("Ready", "Reference configured and command available."),
        state("Operating", "Motor receiving controlled frequency."),
      ],
      chartTitle: "Conceptual speed profile",
      chartDescription:
        "Didactic speed reference curve applied by a VFD.",
      tags: ["VFD", "control", "speed"],
      limitations: [
        "It does not represent a specific manufacturer and does not replace the CFW100 simulator.",
        "There are no interactive parameters or dedicated screen for other drives.",
      ],
    },
    "thermal-magnetic-breaker": {
      name: "Thermal-magnetic breaker",
      shortName: "TM breaker",
      description:
        "Protection against overload and short circuit in power and control circuits.",
      functionDescription:
        "Isolates the circuit and interrupts current when the thermal or magnetic response exceeds the limit.",
      operatingPrinciple:
        "Combines a thermal element for sustained overcurrent and a magnetic element for abrupt faults.",
      typicalApplications: [
        "Power supply for electrical panels.",
        "Protection of motor circuits and auxiliary loads.",
      ],
      mainData: [
        data("Common curves", "B, C and D", ""),
        data("Main protection", "Overload and short circuit", ""),
        data("Operation", "Manual with automatic trip", ""),
      ],
      visualStates: [
        state("Closed", "Circuit energized and handle in operating position."),
        state("Tripped", "Mechanism opened the circuit due to a fault."),
        state("Reset", "Ready for manual reclosing after verification."),
      ],
      chartTitle: "Current vs. trip time",
      chartDescription:
        "Conceptual curve showing that higher currents reduce trip time.",
      tags: ["protection", "curve", "trip"],
      limitations: [
        "This view is only conceptual and does not calculate a real manufacturer curve.",
        "There is no action tied to the main simulator at this stage.",
      ],
    },
    fuse: {
      name: "Fuse",
      shortName: "Fuse",
      description:
        "Protection element that melts its link when current exceeds the limit.",
      functionDescription:
        "Protects circuits against short circuits and, depending on the class, against specific overcurrents.",
      operatingPrinciple:
        "The fuse link heats up by Joule effect until it opens the protected circuit.",
      typicalApplications: [
        "Protection of semiconductors, power supplies, and power circuits.",
        "Supplementary isolation in industrial panels.",
      ],
      mainData: [
        data("Critical quantity", "Rated current", "A"),
        data("Response", "Link melting", ""),
        data("Common classes", "gG, aM, ultra-fast", ""),
      ],
      visualStates: [
        state("Intact", "Link in normal condition and circuit closed."),
        state("Overcurrent", "Increasing heating in the fuse element."),
        state("Open", "Melted link and interrupted circuit."),
      ],
      chartTitle: "Link heating",
      chartDescription:
        "Conceptual representation of the thermal rise that leads to link melting.",
      tags: ["link", "short circuit", "isolation"],
      limitations: [
        "There is no modeling of let-through energy or fuse class selection.",
        "The data is didactic and does not execute real protection in the project.",
      ],
    },
    "thermal-overload-relay": {
      name: "Thermal overload relay",
      shortName: "Thermal relay",
      description:
        "Protection against sustained overload in induction motors.",
      functionDescription:
        "Monitors the thermal effect of current and opens the control circuit when the setting is exceeded.",
      operatingPrinciple:
        "Bimetallic elements or equivalent thermal elements deform with heating and actuate the trip contact.",
      typicalApplications: [
        "Motor control with a contactor.",
        "Direct-on-line or reversing starter panels.",
      ],
      mainData: [
        data("Main reference", "Current adjustment range", "A"),
        data("Typical placement", "Downstream of the contactor", ""),
        data("Reset", "Manual or automatic", ""),
      ],
      visualStates: [
        state("Normal", "Current within the adjusted range."),
        state("Heating", "Overload accumulating thermal energy."),
        state("Tripped", "Control contact opened by overload."),
      ],
      chartTitle: "Thermal buildup",
      chartDescription:
        "Conceptual curve of accumulated heating up to the trip point.",
      tags: ["motor", "overload", "bimetal"],
      limitations: [
        "There is still no independent interactive thermal trip simulation.",
        "The app's real overload remains tied to the CFW100 and the existing model.",
      ],
    },
    "surge-protection-device": {
      name: "SPD",
      shortName: "SPD",
      description:
        "Surge protection device to limit transient overvoltages.",
      functionDescription:
        "Diverts surges to ground and helps preserve sensitive electronics in the panel.",
      operatingPrinciple:
        "Maintains high impedance under normal conditions and low impedance during transient overvoltage.",
      typicalApplications: [
        "Control panels with electronic equipment.",
        "Protection of power supplies, HMIs, and drives against surges.",
      ],
      mainData: [
        data("Key parameter", "Up protection level", ""),
        data("Installation", "Between phase, neutral, and ground", ""),
        data("Protected event", "Transient surges", ""),
      ],
      visualStates: [
        state("Standby", "Waiting, without conducting in normal operation."),
        state("Limiting surge", "Diverts energy to reduce overvoltage."),
        state("End of life", "May require replacement after severe events."),
      ],
      chartTitle: "Limited voltage peak",
      chartDescription:
        "Conceptual example of a surge reduced by the SPD during a transient event.",
      tags: ["surge", "grounding", "protection"],
      limitations: [
        "There is no surge, grounding, or dissipated energy simulation.",
        "The curve is shown only for visual understanding of the principle.",
      ],
    },
    "phase-loss-relay": {
      name: "Phase loss relay",
      shortName: "Phase loss",
      description:
        "Three-phase network monitor for phase loss, sequence, or imbalance.",
      functionDescription:
        "Blocks the control circuit when it detects an unsafe condition in the three-phase supply.",
      operatingPrinciple:
        "Compares phase presence and order, actuating an internal relay when the network leaves the configured range.",
      typicalApplications: [
        "Three-phase motor panels.",
        "Protection of pumps and fans in industrial networks.",
      ],
      mainData: [
        data("Monitored network", "Three-phase", ""),
        data("Typical faults", "Loss, inversion, and imbalance", ""),
        data("Output", "Relay contact", ""),
      ],
      visualStates: [
        state("Valid network", "Sequence and voltage within the expected range."),
        state("Phase alarm", "Fault detected in monitoring."),
        state("Blocked output", "Internal contact changes to prevent the command."),
      ],
      chartTitle: "Phase presence over time",
      chartDescription:
        "Conceptual example of losing one phase and the consequent relay block.",
      tags: ["phase", "network", "monitoring"],
      limitations: [
        "There is still no interactive external three-phase network simulation.",
        "The item serves as a didactic visualization of the protection principle.",
      ],
    },
    contactor: {
      name: "Contactor",
      shortName: "Contactor",
      description:
        "Electromechanical element for switching loads and motors through coil command.",
      functionDescription:
        "Closes or opens main and auxiliary contacts when the command coil is energized.",
      operatingPrinciple:
        "A magnetic field attracts the moving core, displacing the contacts to change circuit state.",
      typicalApplications: [
        "Direct motor starting.",
        "Seal-in, reversing, and interlocking controls.",
      ],
      mainData: [
        data("Command signal", "AC or DC coil", ""),
        data("Contacts", "Main and auxiliary", ""),
        data("Common use", "Load switching", ""),
      ],
      visualStates: [
        state("De-energized", "Coil without voltage and contacts at rest."),
        state("Pulled in", "Coil energized and magnetic core actuated."),
        state("Contacts closed", "Load connected through the main set."),
      ],
      chartTitle: "Coil and contact state",
      chartDescription:
        "Simple logic signal showing when the coil closes the contacts.",
      tags: ["coil", "contacts", "power"],
      limitations: [
        "There is still no simulation of wear, arcing, or mechanical enclosure.",
        "The behavior shown does not drive real loads within the project.",
      ],
    },
    "auxiliary-relay": {
      name: "Auxiliary relay",
      shortName: "Auxiliary relay",
      description:
        "Relay used to multiply contacts and implement control logic.",
      functionDescription:
        "Replicates one command into multiple auxiliary contacts, isolating power and signal levels.",
      operatingPrinciple:
        "The coil energizes a core that shifts NO and NC contacts into new logic states.",
      typicalApplications: [
        "Command latching.",
        "Interlocks and step signaling.",
      ],
      mainData: [
        data("Signal type", "Digital", ""),
        data("Typical contacts", "NO and NC", ""),
        data("Interface", "Relay coil", ""),
      ],
      visualStates: [
        state("Rest", "Contacts remain in their original state."),
        state("Energized", "Coil active and contacts switched."),
        state("Return", "Spring restores the set after the signal is removed."),
      ],
      chartTitle: "Auxiliary contact switching",
      chartDescription:
        "Conceptual representation of the command pulse and the logic state change.",
      tags: ["logic", "seal-in", "contacts"],
      limitations: [
        "There is no control circuit associated with this relay inside the library.",
        "The contacts shown are conceptual and not editable.",
      ],
    },
    "timer-relay": {
      name: "Timer relay",
      shortName: "Timer",
      description:
        "Timing relay to delay or extend control events.",
      functionDescription:
        "Introduces delay on contact energization or de-energization to build sequences.",
      operatingPrinciple:
        "An internal timing circuit counts an interval and then changes the contact state.",
      typicalApplications: [
        "Starting sequences.",
        "Timed signaling and process interlocks.",
      ],
      mainData: [
        data("Main quantity", "Adjusted time", "s"),
        data("Common function", "Delay on energization", ""),
        data("Output", "Timed contact", ""),
      ],
      visualStates: [
        state("Waiting", "Coil active, but contact has not switched yet."),
        state("Timing", "Internal counting in progress."),
        state("Switched", "Contact changed after the configured time."),
      ],
      chartTitle: "Delay time",
      chartDescription:
        "Conceptual curve in which the command occurs before the timed contact response.",
      tags: ["time", "sequence", "control"],
      limitations: [
        "There is no real timer integrated into the simulator circuit.",
        "The chart shows only a fixed conceptual delay.",
      ],
    },
    "push-button-na-nf": {
      name: "NO/NC push button",
      shortName: "Push button",
      description:
        "Momentary command button with normally open and normally closed contacts.",
      functionDescription:
        "Generates a command pulse to start, stop, reset, or interlock functions on the panel.",
      operatingPrinciple:
        "When pressed, the mechanism momentarily switches the contacts and returns by spring when released.",
      typicalApplications: [
        "Start/stop and reset commands.",
        "Step confirmation on didactic benches.",
      ],
      mainData: [
        data("Contact type", "NO/NC", ""),
        data("Operating mode", "Momentary", ""),
        data("Typical signal", "Digital", ""),
      ],
      visualStates: [
        state("Released", "Contacts remain in the rest state."),
        state("Pressed", "Contact changes only during actuation."),
        state("Returned", "The spring takes the assembly back to rest."),
      ],
      chartTitle: "Command pulse",
      chartDescription:
        "Didactic representation of the logic pulse generated by a short press.",
      tags: ["pushbutton", "start", "reset"],
      limitations: [
        "There is no external push button coupled to the main circuit at this stage.",
        "The item serves as a reference for operation and NO/NC nomenclature.",
      ],
    },
    "emergency-stop-button": {
      name: "Emergency stop button",
      shortName: "E-stop",
      description:
        "Safety command to quickly interrupt the action of a machine or panel.",
      functionDescription:
        "Opens the safety circuit to remove the operating permission in abnormal situations.",
      operatingPrinciple:
        "A mechanical mechanism latches the pressed button until manual reset, keeping the circuit open.",
      typicalApplications: [
        "Industrial panels and training benches.",
        "Lines with mechanical risk or need for safe stop.",
      ],
      mainData: [
        data("Main contact", "Safety NC", ""),
        data("Actuation", "Push-to-latch", ""),
        data("Reset", "Manual by twist or pull", ""),
      ],
      visualStates: [
        state("Armed", "Button in normal condition and safety circuit closed."),
        state("Actuated", "NC contact opens and blocks operation."),
        state("Reset", "Permission only after manual unlatching."),
      ],
      chartTitle: "Safety permission",
      chartDescription:
        "Logic signal that drops to zero when the emergency button is actuated.",
      tags: ["safety", "NC", "latching"],
      limitations: [
        "There is no dedicated safety circuit or calculated safety category.",
        "The view does not replace real machine safety practice.",
      ],
    },
    "selector-switch": {
      name: "Selector switch",
      shortName: "Selector",
      description:
        "Switch used to select operating modes or command directions.",
      functionDescription:
        "Maintains a state chosen by the operator, such as local/remote, manual/automatic, or direction.",
      operatingPrinciple:
        "A mechanical shaft keeps the contacts positioned at the selected point until a new commutation.",
      typicalApplications: [
        "Local/remote selection.",
        "Manual/automatic and forward/reverse switches.",
      ],
      mainData: [
        data("Operation", "Maintained", ""),
        data("Common positions", "2 or 3", ""),
        data("Signal type", "Discrete digital", ""),
      ],
      visualStates: [
        state("Position 0", "Initial or neutral switch state."),
        state("Position 1", "First active selection."),
        state("Position 2", "Second active selection, when applicable."),
      ],
      chartTitle: "Position change",
      chartDescription:
        "Conceptual representation of discrete states maintained in a selector switch.",
      tags: ["mode", "selection", "manual"],
      limitations: [
        "There is no selector switch connected to the app flow at this stage.",
        "The curve only shows the idea of maintained discrete states.",
      ],
    },
    "pilot-light": {
      name: "Pilot light",
      shortName: "Pilot light",
      description:
        "Luminous indicator for operating, alarm, or availability states.",
      functionDescription:
        "Converts an electrical state into a visual indication for the panel operator.",
      operatingPrinciple:
        "When powered, the luminous element emits steady or flashing light according to the command circuit.",
      typicalApplications: [
        "Indicate running, stopped, fault, or alarm.",
        "Confirm permission or process step.",
      ],
      mainData: [
        data("Common technology", "LED", ""),
        data("Typical colors", "Red, green, yellow", ""),
        data("Signal type", "Digital", ""),
      ],
      visualStates: [
        state("Off", "No power supply or command turned off."),
        state("On", "Visual indication continuously active."),
        state("Flashing", "Intermittent indication to draw attention."),
      ],
      chartTitle: "Light signal",
      chartDescription:
        "Simple logic pulse illustrating a pilot light in the on state.",
      tags: ["indication", "LED", "panel"],
      limitations: [
        "There are no real pilot lights inserted in the application layout.",
        "The view does not control colors dynamically by simulator event.",
      ],
    },
    buzzer: {
      name: "Buzzer",
      shortName: "Buzzer",
      description:
        "Audible signaling device for alarms and events that require attention.",
      functionDescription:
        "Emits an audible warning when an alarm, fault, or permission circuit is activated.",
      operatingPrinciple:
        "A piezoelectric or electromagnetic element vibrates when energized and produces audible sound.",
      typicalApplications: [
        "Panel alarms.",
        "Anomaly warning or end-of-cycle indication.",
      ],
      mainData: [
        data("Command signal", "Digital", ""),
        data("Output", "Audible warning", ""),
        data("Common technology", "Piezoelectric", ""),
      ],
      visualStates: [
        state("Silent", "No power or no alarm."),
        state("Active", "Sound emitted continuously."),
        state("Intermittent", "Alternating warning to draw attention."),
      ],
      chartTitle: "Buzzer drive signal",
      chartDescription:
        "Conceptual example of logic pulses used for an intermittent buzzer.",
      tags: ["alarm", "sound", "indication"],
      limitations: [
        "There is no real audio in the library.",
        "The representation is limited to didactic data and visual states.",
      ],
    },
    "inductive-sensor": {
      name: "Inductive sensor",
      shortName: "Inductive",
      description:
        "Non-contact sensor for detecting metals at short distance.",
      functionDescription:
        "Reports the presence of a metallic target to the control system through a digital output.",
      operatingPrinciple:
        "An internal oscillator creates an electromagnetic field; metal approaching changes that field and switches the output.",
      typicalApplications: [
        "Detection of metal parts on conveyors.",
        "Counting and positioning in automation.",
      ],
      mainData: [
        data("Typical target", "Metal", ""),
        data("Common output", "PNP or NPN", ""),
        data("Typical supply", "10 to 30", "Vdc"),
      ],
      visualStates: [
        state("No detection", "No metallic target within the sensing distance."),
        state("Detection active", "Target approach switched the output."),
        state("Return", "Output returns to rest when the target moves away."),
      ],
      chartTitle: "Inductive sensor output",
      chartDescription:
        "Simple logic signal indicating the approach and departure of a metallic target.",
      tags: ["sensor", "metal", "PNP"],
      limitations: [
        "There is still no interactive virtual target for this sensor.",
        "The library shows only the detection principle and expected response.",
      ],
    },
    "capacitive-sensor": {
      name: "Capacitive sensor",
      shortName: "Capacitive",
      description:
        "Non-contact sensor for solid or liquid materials based on capacitance variation.",
      functionDescription:
        "Detects different materials and delivers a digital output to the control circuit.",
      operatingPrinciple:
        "Material approach changes the capacitance of the sensor's electric field and changes the output state.",
      typicalApplications: [
        "Level detection in tanks.",
        "Presence of non-metallic materials.",
      ],
      mainData: [
        data("Typical target", "Solids and liquids", ""),
        data("Common adjustment", "Front sensitivity", ""),
        data("Output", "PNP/NPN digital", ""),
      ],
      visualStates: [
        state("No material", "Electric field without relevant change."),
        state("Detection", "Capacitance changed by target presence."),
        state("Fine adjustment", "Sensitivity set for the observed material."),
      ],
      chartTitle: "Signal variation by approach",
      chartDescription:
        "Conceptual curve of increasing response as material approaches the sensor.",
      tags: ["sensor", "level", "material"],
      limitations: [
        "There is no fine adjustment simulation by material type.",
        "The data is intended as didactic support, not real calibration.",
      ],
    },
    "photoelectric-sensor": {
      name: "Photoelectric sensor",
      shortName: "Photoelectric",
      description:
        "Optical sensor for detecting objects through emitted and received light beam.",
      functionDescription:
        "Converts light interruption or reflection into a digital signal for control.",
      operatingPrinciple:
        "An emitter sends light and a receiver monitors its presence or reflection, switching the output when the pattern changes.",
      typicalApplications: [
        "Counting parts and packages.",
        "Optical barriers in light automation.",
      ],
      mainData: [
        data("Common method", "Through-beam, reflective, or diffuse", ""),
        data("Output", "Digital", ""),
        data("Observed variable", "Beam interruption", ""),
      ],
      visualStates: [
        state("Beam clear", "Receiver gets the expected signal."),
        state("Object detected", "Beam interrupted or reflected according to the type."),
        state("Normal return", "Beam restored and output returns."),
      ],
      chartTitle: "Detected optical signal",
      chartDescription:
        "Binary representation of the state change when an object crosses the beam.",
      tags: ["sensor", "optical", "barrier"],
      limitations: [
        "There is no graphical scenario with beam, reflector, or physical target.",
        "The item explains the concept, but does not have real optical simulation.",
      ],
    },
    "limit-switch": {
      name: "Limit switch",
      shortName: "Limit switch",
      description:
        "Mechanical sensor actuated by physical contact at the end of a travel.",
      functionDescription:
        "Reports the movement limit or the presence of a mechanical position in the system.",
      operatingPrinciple:
        "A mechanical lever or plunger shifts internal contacts when touched by a moving element.",
      typicalApplications: [
        "Actuator positioning.",
        "End-of-travel for doors, shafts, and conveyors.",
      ],
      mainData: [
        data("Actuation type", "Mechanical", ""),
        data("Contacts", "NO/NC", ""),
        data("Signal", "Digital", ""),
      ],
      visualStates: [
        state("Free", "No actuator pressing the mechanism."),
        state("Pressed", "Mechanical movement changed the contacts."),
        state("Return", "The mechanism returns to the initial state after releasing the actuator."),
      ],
      chartTitle: "Mechanical limit contact",
      chartDescription:
        "Simple pulse representing the moment when the mechanical limit was reached.",
      tags: ["mechanical", "limit", "NO/NC"],
      limitations: [
        "There is no physical mechanism in the app to actuate the limit switch.",
        "The visualization is only documentary and didactic.",
      ],
    },
    encoder: {
      name: "Encoder",
      shortName: "Encoder",
      description:
        "Feedback sensor for speed, position, or rotation direction.",
      functionDescription:
        "Provides pulses proportional to shaft movement for monitoring or control loops.",
      operatingPrinciple:
        "A disc or magnetic element generates pulses read electronically according to shaft rotation.",
      typicalApplications: [
        "Speed feedback.",
        "Pulse counting and positioning.",
      ],
      mainData: [
        data("Typical output", "A/B/Z pulses", ""),
        data("Observed quantity", "Rotation and position", ""),
        data("Didactic use", "Motion feedback", ""),
      ],
      visualStates: [
        state("Stopped", "No pulses, shaft without movement."),
        state("Rotating", "Pulse sequence proportional to speed."),
        state("Reference", "Index pulse at one specific turn."),
      ],
      chartTitle: "Encoder pulses",
      chartDescription:
        "Conceptual representation of pulse generation according to shaft movement.",
      tags: ["feedback", "pulses", "speed"],
      limitations: [
        "There is no encoder feedback connected to the CFW100 simulator.",
        "The curve does not represent real resolution or full quadrature.",
      ],
    },
    "temperature-sensor": {
      name: "Temperature sensor",
      shortName: "Temp sensor",
      description:
        "Sensor used to monitor motor, module, or process heating.",
      functionDescription:
        "Converts temperature into an analog or digital signal for protection, alarm, or control.",
      operatingPrinciple:
        "The resistance, voltage, or state of the sensing element changes with temperature and is interpreted by the circuit.",
      typicalApplications: [
        "Thermal protection of motors and drives.",
        "Process and ambient supervision.",
      ],
      mainData: [
        data("Common signals", "PT100, NTC, 4-20 mA", ""),
        data("Measured quantity", "Temperature", "C"),
        data("Use", "Alarm and monitoring", ""),
      ],
      visualStates: [
        state("Nominal temperature", "Reading within the safe range."),
        state("Heating", "Value rises with load or ambient conditions."),
        state("Alarm", "Value exceeds the configured limit."),
      ],
      chartTitle: "Temperature over time",
      chartDescription:
        "Didactic thermal rise curve used to understand temperature alarms.",
      tags: ["temperature", "alarm", "analog"],
      limitations: [
        "There is no external temperature sensor integrated with the global state.",
        "The main app reading remains tied to the CFW100 module.",
      ],
    },
    plc: {
      name: "PLC",
      shortName: "PLC",
      description:
        "Programmable logic controller for sequential logic and interlocks.",
      functionDescription:
        "Executes automation rules to read inputs, process logic, and command outputs.",
      operatingPrinciple:
        "Scans inputs, executes a cyclic program, and updates outputs within a repetitive scan time.",
      typicalApplications: [
        "Automation of machines and panels.",
        "Interlocked sequences with sensors and actuators.",
      ],
      mainData: [
        data("Basic cycle", "Read, logic, and write", ""),
        data("Signals", "Digital/analog inputs and outputs", ""),
        data("Didactic time", "Cyclic scan", "ms"),
      ],
      visualStates: [
        state("RUN", "Program running and outputs able to update."),
        state("STOP", "Program stopped for maintenance or adjustment."),
        state("Fault", "Internal error or critical diagnostic."),
      ],
      chartTitle: "Scan cycle",
      chartDescription:
        "Conceptual curve of the repetitive read, processing, and update cycle.",
      tags: ["automation", "scan", "logic"],
      limitations: [
        "There is still no PLC runtime or interactive programming.",
        "The item serves for conceptual study of automation architecture.",
      ],
    },
    hmi: {
      name: "HMI",
      shortName: "HMI",
      description:
        "Human-machine interface for operation, adjustment, and diagnostics.",
      functionDescription:
        "Displays states, alarms, setpoints, and commands on a dedicated screen for the operator.",
      operatingPrinciple:
        "Receives controller data, organizes screens, and sends navigation or adjustment commands.",
      typicalApplications: [
        "Local supervision panels.",
        "Parameter adjustment and alarm display.",
      ],
      mainData: [
        data("Interaction", "Touch, buttons, or navigation", ""),
        data("Displayed data", "States, alarms, setpoints", ""),
        data("Role in the current project", "Conceptual beyond the CFW100 HMI", ""),
      ],
      visualStates: [
        state("Main screen", "Summary of the process or equipment."),
        state("Adjustment screen", "Operator changes parameters and setpoints."),
        state("Alarm screen", "Lists faults and guides diagnostics."),
      ],
      chartTitle: "Screen update",
      chartDescription:
        "Simple representation of the data update flow between controller and HMI.",
      tags: ["interface", "operator", "diagnostics"],
      limitations: [
        "The project's only real interactive interface remains the CFW100 front HMI.",
        "There is no external HMI screen or page navigation at this stage.",
      ],
    },
    "digital-input-module": {
      name: "Digital input module",
      shortName: "Digital input",
      description:
        "Module for reading discrete signals from buttons, sensors, and contacts.",
      functionDescription:
        "Converts field states into bits available to the logic controller.",
      operatingPrinciple:
        "Monitors voltage or continuity on independent channels and updates the associated logic state.",
      typicalApplications: [
        "Field sensor reading.",
        "Interface between push buttons and PLC.",
      ],
      mainData: [
        data("Signal type", "Discrete digital", ""),
        data("Common channels", "8, 16, or 32", ""),
        data("Typical voltage", "24", "Vdc"),
      ],
      visualStates: [
        state("Channel at 0", "No signal present or contact open."),
        state("Channel at 1", "Signal present on the channel."),
        state("Read fault", "Inconsistent value or missing reference."),
      ],
      chartTitle: "Input logic state",
      chartDescription:
        "Change of a digital channel over the sampling interval.",
      limitations: [
        "There is no PLC or modular backplane active to consume these channels.",
        "The representation is only didactic and does not reflect a real protocol.",
      ],
    },
    "digital-output-module": {
      name: "Digital output module",
      shortName: "Digital output",
      description:
        "Module used to drive discrete signals from a controller.",
      functionDescription:
        "Delivers logic levels or switching for relays, contactors, pilot lights, and other actuators.",
      operatingPrinciple:
        "An internal command sets the output channel, enabling a transistor, relay, or triac depending on the module.",
      typicalApplications: [
        "Driving signaling devices and interfaces.",
        "Commanding auxiliary relays or contactors.",
      ],
      mainData: [
        data("Channel type", "Transistor or relay", ""),
        data("Signal", "Digital", ""),
        data("Typical use", "Actuator driving", ""),
      ],
      visualStates: [
        state("Off", "Channel without energized output."),
        state("On", "Channel delivers signal or voltage to the actuator."),
        state("Protected", "Output inhibited by fault or interlock."),
      ],
      chartTitle: "Discrete output command",
      chartDescription:
        "Logic signal of the output channel when the controller enables an actuator.",
      tags: ["I/O", "output", "actuator"],
      limitations: [
        "There is no output module controlling real components in the library.",
        "The states shown are not tied to an actual controller.",
      ],
    },
    "analog-module": {
      name: "Analog module",
      shortName: "Analog module",
      description:
        "Module for reading or sending continuous signals in analog loops.",
      functionDescription:
        "Interfaces analog sensors or actuators with the controller, converting continuous quantities.",
      operatingPrinciple:
        "Converts analog voltage or current into a numeric value, or the reverse, for automation logic.",
      typicalApplications: [
        "Reading pressure, temperature, or level.",
        "Analog reference command for drives.",
      ],
      mainData: [
        data("Typical ranges", "0-10 V / 4-20 mA", ""),
        data("Quantity type", "Analog", ""),
        data("Use", "Measurement and command", ""),
      ],
      visualStates: [
        state("Zero scale", "No reference or minimum value."),
        state("Mid scale", "Proportional reading or command."),
        state("Full scale", "Maximum configured range value."),
      ],
      chartTitle: "Analog signal",
      chartDescription:
        "Simple analog variation curve across the operating range.",
      limitations: [
        "There is no real analog conversion connected to a PLC or external drive.",
        "The chart only shows the idea of range proportionality.",
      ],
    },
    "power-supply-24vdc": {
      name: "24 Vdc power supply",
      shortName: "24 Vdc supply",
      description:
        "Auxiliary supply used to power commands, sensors, and automation modules.",
      functionDescription:
        "Converts line input into regulated DC voltage for control circuits.",
      operatingPrinciple:
        "Rectifies and regulates the input voltage to keep a stable DC output within the panel range.",
      typicalApplications: [
        "Powering sensors, PLCs, and relays.",
        "24 Vdc control circuits.",
      ],
      mainData: [
        data("Typical output", "24", "Vdc"),
        data("Use", "Control and instrumentation", ""),
        data("Expected behavior", "Stabilized voltage", ""),
      ],
      visualStates: [
        state("No mains", "Supply without input and without output voltage."),
        state("Regulated", "Stabilized output in normal operation."),
        state("Overload", "Output limited or protected by excessive consumption."),
      ],
      chartTitle: "DC output stability",
      chartDescription:
        "Conceptual variation of the output voltage of a regulated 24 Vdc supply.",
      tags: ["24V", "control", "supply"],
      limitations: [
        "There is still no shared 24 Vdc bus among components.",
        "The visualization does not calculate ripple, efficiency, or dissipation.",
      ],
    },
    transformer: {
      name: "Transformer",
      shortName: "Transformer",
      description:
        "Electromagnetic element used to step up, step down, or isolate AC voltages.",
      functionDescription:
        "Adapts voltage levels and provides galvanic isolation between circuits.",
      operatingPrinciple:
        "An alternating magnetic flux in the core transfers energy between windings by electromagnetic induction.",
      typicalApplications: [
        "Control supplies and circuit isolation.",
        "Voltage adaptation between mains and load.",
      ],
      mainData: [
        data("Common input", "127/220", "Vac"),
        data("Common output", "24 or 110", "Vac"),
        data("Principle", "Magnetic induction", ""),
      ],
      visualStates: [
        state("Not excited", "Primary without applied voltage."),
        state("Magnetized", "Core with alternating flux in operation."),
        state("Delivering voltage", "Secondary supplying voltage to the load."),
      ],
      chartTitle: "Primary and secondary voltage",
      chartDescription:
        "Conceptual comparison of AC voltage transferred between windings.",
      tags: ["isolation", "AC", "winding"],
      limitations: [
        "There is no real AC waveform or calculated turns ratio.",
        "The data only serves to support understanding of the principle.",
      ],
    },
    "signal-converter": {
      name: "Signal converter",
      shortName: "Converter",
      description:
        "Interface used to convert one type of electrical signal into another.",
      functionDescription:
        "Adapts field signals for PLC inputs, drives, or supervision instruments.",
      operatingPrinciple:
        "A conditioning circuit adjusts signal amplitude, type, or standard to the required range.",
      typicalApplications: [
        "Convert 4-20 mA into 0-10 V.",
        "Adapt sensors to controller inputs.",
      ],
      mainData: [
        data("Common conversions", "4-20 mA <-> 0-10 V", ""),
        data("Purpose", "Signal compatibility", ""),
        data("Range", "Analog", ""),
      ],
      visualStates: [
        state("Raw input", "Signal received from the field."),
        state("Conditioning", "Circuit adjusting gain or offset."),
        state("Processed output", "Signal ready for the destination equipment."),
      ],
      chartTitle: "Analog conversion",
      chartDescription:
        "Didactic example of the proportional relationship between an input signal and its converted output.",
      tags: ["analog", "interface", "conditioning"],
      limitations: [
        "There is no interactive adjustment of scale, gain, or offset.",
        "The library does not connect the converter to a real loop in the app.",
      ],
    },
    "relay-interface": {
      name: "Relay interface",
      shortName: "Relay interface",
      description:
        "Interface module used to isolate and adapt signals between logic and load.",
      functionDescription:
        "Receives a low-level command and replicates it on an isolated output relay.",
      operatingPrinciple:
        "An input actuates the module coil or transistor, which in turn switches an internal relay.",
      typicalApplications: [
        "Isolate PLC outputs.",
        "Drive small loads or auxiliary circuits.",
      ],
      mainData: [
        data("Common input", "24", "Vdc"),
        data("Output", "Relay contact", ""),
        data("Benefit", "Isolation and adaptation", ""),
      ],
      visualStates: [
        state("Input at 0", "Module without drive command."),
        state("Relay energized", "Active input switching the internal contact."),
        state("Output switched", "Load or auxiliary circuit receives the new state."),
      ],
      chartTitle: "Input-to-switching relation",
      chartDescription:
        "Didactic logic signal showing the relation between the command and the relay output.",
      tags: ["isolation", "relay", "interface"],
      limitations: [
        "There is no real connection with a PLC or external loads.",
        "The representation does not include contact wear or detailed mechanical delay.",
      ],
    },
    "terminal-block": {
      name: "Terminal block",
      shortName: "Terminal block",
      description:
        "Connection point used to distribute and organize conductors in the panel.",
      functionDescription:
        "Receives, secures, and identifies wires, making maintenance and orderly interconnection easier.",
      operatingPrinciple:
        "An insulating body and a metallic element compress the conductor to ensure safe electrical contact.",
      typicalApplications: [
        "Distribution of signals and power.",
        "Pass-through points between field and panel.",
      ],
      mainData: [
        data("Function", "Connection and identification", ""),
        data("Mounting", "DIN rail", ""),
        data("Typical conductor", "Solid or flexible", ""),
      ],
      visualStates: [
        state("Free", "Terminal block without a conductor installed."),
        state("Connected", "Conductor correctly fixed."),
        state("Maintenance", "Terminal block accessed for testing or replacement."),
      ],
      chartTitle: "Connection continuity",
      chartDescription:
        "Simple signal illustrating the presence or absence of electrical continuity at the terminal block.",
      tags: ["connection", "panel", "distribution"],
      limitations: [
        "There is no physical interconnection between library items.",
        "The visualization does not replace a real terminal wiring diagram.",
      ],
    },
    "din-rail": {
      name: "DIN rail",
      shortName: "DIN rail",
      description:
        "Standard metal profile for mounting modular components in panels.",
      functionDescription:
        "Acts as the mechanical base for organizing power supplies, terminals, relays, and modules.",
      operatingPrinciple:
        "Components with suitable clips are mechanically locked onto the rail profile.",
      typicalApplications: [
        "Assembly of control panels.",
        "Modular organization of industrial components.",
      ],
      mainData: [
        data("Function", "Mechanical mounting", ""),
        data("Common standard", "35 mm", ""),
        data("Use", "Modular assembly", ""),
      ],
      visualStates: [
        state("Empty", "Rail without attached components."),
        state("Mounted", "Components mechanically fixed to the profile."),
        state("Expansion", "Space reserved for new modules."),
      ],
      chartTitle: "Rail occupancy",
      chartDescription:
        "Conceptual curve of modular occupancy throughout panel assembly.",
      tags: ["mechanics", "mounting", "modular"],
      limitations: [
        "There is no graphical panel assembly in the current library.",
        "The chart only represents the concept of modular occupancy.",
      ],
    },
    "wiring-duct": {
      name: "Wiring duct",
      shortName: "Wiring duct",
      description:
        "Organizing element used to route wires inside the panel.",
      functionDescription:
        "Groups and separates cables to keep the panel clean, safe, and traceable.",
      operatingPrinciple:
        "Conductors are arranged inside a channel with side openings for orderly distribution.",
      typicalApplications: [
        "Organization of control and power cables.",
        "Separation of circuits inside the panel.",
      ],
      mainData: [
        data("Function", "Cable organization", ""),
        data("Installation", "Inside the panel", ""),
        data("Benefit", "Maintenance and visual cleanliness", ""),
      ],
      visualStates: [
        state("Empty", "Wiring duct without conductors."),
        state("Filled", "Cables arranged and routed internally."),
        state("Inspection", "Cover open for maintenance or expansion."),
      ],
      chartTitle: "Wiring duct occupancy",
      chartDescription:
        "Conceptual representation of duct fill as new cables are added.",
      tags: ["organization", "cables", "panel"],
      limitations: [
        "There is no physical cable routing in the library.",
        "The data has only a visual and organizational purpose.",
      ],
    },
    "control-cable": {
      name: "Control cable",
      shortName: "Control cable",
      description:
        "Conductor used for command signals, sensors, and interlocks.",
      functionDescription:
        "Carries low-power signals between push buttons, sensors, relays, and controllers.",
      operatingPrinciple:
        "The cable provides an electrical path with suitable insulation for discrete or analog signals.",
      typicalApplications: [
        "Interconnection of push buttons, sensors, and PLCs.",
        "Auxiliary circuits in electrical panels.",
      ],
      mainData: [
        data("Type of use", "Command signals", ""),
        data("Conductor", "Flexible copper", ""),
        data("Important feature", "Identification and organization", ""),
      ],
      visualStates: [
        state("Not installed", "No interconnection between circuit points."),
        state("Connected", "Signal can travel between source and destination."),
        state("Identified", "Conductor marked for maintenance and diagnostics."),
      ],
      chartTitle: "Signal presence in the cable",
      chartDescription:
        "Binary example of carrying a command signal between two points.",
      tags: ["cables", "signal", "connection"],
      limitations: [
        "The library does not draw physical routes or real wire numbering.",
        "The representation does not address length, voltage drop, or EMC compatibility.",
      ],
    },
    "ferrule-terminal": {
      name: "Ferrule terminal",
      shortName: "Ferrule terminal",
      description:
        "Accessory used for finishing and secure connection of flexible conductors.",
      functionDescription:
        "Improves the mechanical and electrical contact of the wire in terminals and clamping devices.",
      operatingPrinciple:
        "A metal tube crimped onto the wire gathers the strands and enables consistent tightening.",
      typicalApplications: [
        "Terminal block and contactor terminations.",
        "Finishing of control cable harnesses.",
      ],
      mainData: [
        data("Main use", "Flexible cable finishing", ""),
        data("Process", "Crimping", ""),
        data("Benefit", "More stable contact", ""),
      ],
      visualStates: [
        state("Without ferrule", "Exposed strands and less uniform connection."),
        state("Crimped", "Ferrule correctly pressed onto the conductor."),
        state("Installed", "Assembly ready for fixing on a terminal block or device."),
      ],
      chartTitle: "Contact quality",
      chartDescription:
        "Conceptual comparison of contact stability after applying the ferrule.",
      tags: ["crimping", "finishing", "connection"],
      limitations: [
        "There is no real tightening or crimp verification in the library.",
        "The chart is only a visual metaphor for contact quality.",
      ],
    },
  },
};

const LOCALIZABLE_COMPONENT_FIELDS = [
  "name",
  "shortName",
  "description",
  "functionDescription",
  "operatingPrinciple",
  "typicalApplications",
  "mainData",
  "visualStates",
  "chartTitle",
  "chartDescription",
  "chartData",
  "tags",
  "limitations",
];

function getComponentTranslations(componentId, language) {
  return COMPONENT_LIBRARY_TRANSLATIONS[language]?.[componentId] ?? null;
}

export function localizeComponent(component, language) {
  if (!component || typeof component !== "object") {
    return component;
  }

  const resolvedLanguage = resolveLanguageCode(language);
  if (resolvedLanguage === DEFAULT_LANGUAGE) {
    return component;
  }

  const translations = getComponentTranslations(component.id, resolvedLanguage);
  if (!translations) {
    return component;
  }

  const localizedComponent = { ...component };

  for (const field of LOCALIZABLE_COMPONENT_FIELDS) {
    localizedComponent[field] = translations[field] ?? component[field];
  }

  return localizedComponent;
}

export function localizeComponentList(components, language) {
  if (!Array.isArray(components)) {
    return [];
  }

  return components.map((component) => localizeComponent(component, language));
}
