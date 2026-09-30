
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

import * as DebugDraw from "./DebugDraw.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime: IRuntime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.

	DebugDraw.Init(runtime);
	
	runtime.addEventListener("pretick", () => PreTick(runtime));
	runtime.addEventListener("tick", () => Tick(runtime));
	runtime.addEventListener("tick2", () => Tick2(runtime));
}

function PreTick(runtime: IRuntime)
{
	DebugDraw.Tick();
}

function Tick(runtime: IRuntime)
{
}

function Tick2(runtime: IRuntime)
{
}
