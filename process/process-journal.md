# The initial thinking (Tuesday, 26 February 2019, 15:03PM)

So as I start writing this all I can say is that I thought of the "Teaches Typing" extension to the "franchise" while in the bath, and didn't think more about it than the name. It just seems like a great candidate for a variation on the formula of the game, a classic mechanic to introduce, and a nice chance to revisit a typing game, which I haven't done since [Safety Instructions](http://www.pippinbarr.com/games/safetyinstructions/SafetyInstructions.html) in 2011.

## The obvious mechanic: discrete words

The most basic, and therefore probably not quite right, idea that jumps into my head is just to change the basic input from button-mashing to typing a specific verb that represents the action. So in Prometheus you type "STRUGGLE" and he struggles to dislodge the eagle once it's typed correctly. In Sisyphus you type "PUSH" and he pushes on the boulder. In Tantalus you type "APPLE"(?) And he reaches for the apple.

That would work and is certainly the easiest translation from one to the other. You could add some variance to it by having the word you're typing change, so "STRUGGLE" "WRITHE" "SQUIRM" "STRAIN" and so on. Synonyms. Could conceivably have tons of synonyms?

I think this would be a perfectly reasonable approach to the game, pretty basic, but reasonable. It matches the "teaches typing" mandate in that especially if you have multiple synonyms you can't get comfortable. It ties the typing directly to an action in a discrete way, which strikes me as good.

## Storytelling through continuous typing

Another route would be continuous typing rather than discrete words. In this case you'd need some kind of text that you're typing, and there are different candidates for this I guess...

- Retelling the myth itself by typing it out (repeatedly I suppose), potentially fairly elaborate, could be length.
- Typing out some kind of inner monologue of the character in question (something I did in the Nightmare Mode of Safety Instructions), a potential for comic writing etc. on my side, perhaps less "austere" than I could want
- Typing out something completely unrelated (that would be kiiiind of hilarious), or tangentially related, like a text about the physics of rolling, say, for Sisyphus, or the uses of fire by humans for Prometheus. There's something nice to that

In these kinds of cases I guess the point would be that for as long as you continuously and successfully type, the character would perform their action (Sisyphus pushes, Prometheus struggles, Danaids fetch water, etc.). This _wouldn't_ actually work for Tantalus, who has a choice of what he's going to reach for, but perhaps in that instance you could have two texts (one about apples and one about water).

There's an appeal to this mode because it allows for more expressive texts and thus more interest for the player in terms of performance. There's the issue that because it's non-discrete you're never really directly _enacting_ the struggle, but rather supporting it in an almost secondary way, providing fuel for the struggle or something.

## Discrete actions within storytelling?

One hybrid mode could be that you have a continuous text, but it's a text that contains regular synonyms for the action in question, either just jammed in there or actually integrated into the text or even weirdly replacing regular words in the text. This way the event in question would only happen when you complete typing the action word, and the rest of the typing it about reaching the next action word. They could be signified differently with colour or something to clarify.

But it's definitely a bit more complex than I immediately love.

## Thunder stealing from Oral Tradition?

Because I know I want to have an Oral Tradition Edition with voice recognition, I have a kind of competition over textual input (whether vocal or keyboard) that I have to be aware of. In the case of Oral Tradition it seems like I'll be asking these same questions, though in the context of what it makes sense to say. It could be that single words (possibly including synonyms) are going to make the most sense here because voice recognition isn't the most reliable and saying long sentences could be asking for trouble.

At any rate, I do need to be aware of that tension.

## What Would Mavis Beacon Do?

Obviously the "Teaches Typing" in the title comes from Mavis Beacon, so what do the levels look like in that software? What do you do? I remember a car racing game, but what was I actually typing while that was happening? Let's see...

> "Brazen gazelles quickly examined the forward jeep. The brown dog quickly jumped over the lazy fox. Will the kind judge squelch the five or six brazen nymphs?"   

- ([Let's Play Mavis Beacon Teaches Typing](https://www.youtube.com/watch?v=DQ3B1PUwr0I))

This sort of suggests that Mavis Beacon might even procedurally generate? Or at least has a bunch of phrases presumably designed to be difficult to type, distributed around the keyboard, and so forth. Importantly(?) the phrases are pretty nonsense-y and not connected to the context of a car race. So I guess nonsense is an option?

It's not very satisfying though, given that it kind of abdicates the connection between typing and action. Or rather, in Mavis Beacon it's just typing _speed_ that counts, not actually the thing you're typing which is arbitrary. Fair enough.

## So what do you want to try?

Well,

a) I can just implement a ton of the game without having to actually decide exactly what you're meant to be typing... the basic premise will be the same, type some predetermined text in order to perform the key actions.

b) I'm kind of into the idea of using the Mavis Beacon racing game as the core concept, which would mean having text "in the sky" that you're supposed to type.

c) I'm also therefore into the idea of a longer text rather than something brief, because of not wanting to steal the simpler idea from Oral Tradition, and because I think it creates more room for something to actually do while you play the game.

d) I suspect that if the text is semi-interesting to read as you type then maybe it's not even so bad if it doesn't have discrete actions? Another option though would be that each sentence is just some kind of generated expression of what you're doing? Using Tracery or something similar to create repetitious but varied statements of the action in question. "Push the boulder. Push on the boulder. Push the stone. Roll the stone. Resist the stone." etc. But that already looks pretty fucking boring.

e) Okay so is it that you type a continuous text and that the character just does its thing for as long as you maintain constant typing? Seems reasonable and is the most flexible in terms of the text. The simplest version is that ever n characters it performs the correct action where it's discrete (e.g. Prometheus) and otherwise some minimum wpm in order to maintain the effort required (all the others). Actually maybe just a minimum wpm for all of them, it's very Mavis, and for Prometheus the correct wpm represents continuous struggle.

f) What happens when you finish the text? It just starts up again? Should it be an entire novel's worth of stuff? Could I do some weird version of a novel where I replace a bunch of stuff to create a novel about the specific task in question? How hard would that actually be? Kind of funny concept.

g) Why am I writing this inane lettered list?

h) Well I guess the next step is to let this marinade and work on the technology side for a bit, then return to it.

## Here's what we're going to do

Each game is played by typing a longer text (unsure how long) and the action component is determined by maintaining a specific WPM as per Mavis Beacon.

To make this work I need to

- Implement the basic idea of typing as input
- Track WPM
- Cause the appropriate actions to start/pause based on WPM
- Figure out what kind of text will be the most fun thing to type in
- Work out what happens if you exhaust the text (if that's something possible)
- Markov chains on relevant texts to generate infinite fucked up texts about the myth in question???
