# Approved Ingredients

## Purpose
- The closed list of everything a potion may contain. Nothing outside this file may
  ever reach a child.
- Both generators read it. The `witch generator` is given this list and chooses from
  it; anything it returns that is not here is dropped before the potion is served.

## The rules every entry obeys

1. **Real and easy to find.** A kitchen cupboard, a garden or park, or a craft drawer.
   Nothing that needs buying specially.
2. **Harmless if tasted.** Potions are never for drinking and every potion says so —
   but a seven-year-old told not to taste something will sometimes taste it anyway.
   "Not for drinking" is a rule of the game. This list is the actual safety net.
   Non-edible is fine; toxic is not.
3. **Nothing from an animal.** No feathers, no shells, no bones, no fur.
4. **Nothing sharp, nothing hot, nothing that needs cutting or cooking.**
5. **Nothing a child could choke on** at the age this is built for.

## Feeling tags

Each ingredient answers one or more feelings. The generators match a trouble to these.

`scared` · `worried` · `lonely` · `left-out` · `sad` · `angry` · `frustrated` ·
`jealous` · `bored` · `restless` · `embarrassed` · `tired` · `missing-someone` ·
`nervous` · `disappointed` · `stuck`

## Kitchen cupboard

| Ingredient | Answers | Why the witch reaches for it |
|---|---|---|
| half a cup of water | *base* | Every potion starts here |
| a spoonful of flour | worried, scared | Soft, plain, settles everything down |
| three pinches of salt | scared, worried | The oldest protection there is |
| a spoonful of sugar | sad, disappointed | For when something needs sweetening |
| a shake of cinnamon | lonely, sad | Warmth you can smell |
| a spoonful of porridge oats | nervous, worried | Slow and steady, never in a hurry |
| a squeeze of lemon juice | tired, bored | Sharp enough to wake a potion up |
| a spoonful of baking soda | angry, frustrated | With the lemon, it fizzes. That is the anger leaving |
| a drop of vanilla | sad, missing-someone | Smells like someone baking for you |
| a spoonful of cocoa powder | jealous, sad | Dark and deep, for the feelings you don't say out loud |
| a drop of honey | sad, missing-someone | Slow, golden, sticks around |
| a spoonful of dry rice | bored, restless | Rattles like rain on a window |
| a strip of orange peel | sad, bored | Brightness you can hold |
| a dried pasta star | nervous, hopeful | A wish shaped like a star |
| a raisin | worried | A small shrivelled worry. Put it in and it is out of you |
| a mint leaf | angry | Cool on a hot feeling |
| a drop of food colouring | bored, embarrassed | Changes everything at once |
| a breadcrumb | lonely, left-out | Small enough to share |
| a sunflower seed | frustrated, stuck | Not grown yet. That is allowed |

## Garden or park

| Ingredient | Answers | Why the witch reaches for it |
|---|---|---|
| a rose petal | sad, embarrassed | Soft, for a feeling that got bruised |
| a daisy | lonely, left-out | Never grows on its own |
| a dandelion | nervous, hopeful | Made entirely of wishes |
| a clover leaf | nervous | Luck, whether or not it has four |
| a blade of grass | left-out | Ordinary, and everywhere, and fine |
| a smooth pebble | angry, worried | Heavy. Put it down in the bowl |
| a fallen leaf | sad, frustrated | It let go and nothing bad happened |
| a sprig of lavender | tired, worried | For a head that will not switch off |
| a fallen flower head | sad, lonely | Someone's, once. Now yours |
| a spoonful of clean play sand | bored, restless | Time going past, one grain at a time |

## Craft drawer

| Ingredient | Answers | Why the witch reaches for it |
|---|---|---|
| a shake of edible glitter | sad, embarrassed | Nothing stays glum with glitter in it |
| a dab of washable poster paint | bored, sad | Colour, and it washes off |
| a length of ribbon | lonely, missing-someone | For tying two things back together |
| a piece of string | missing-someone | A line between here and there |
| a cotton wool ball | scared, sad | Something soft to land on |
| a paper star, cut out | nervous, hopeful | You made the wish yourself |
| a pom-pom | bored, sad | Cheerful for no reason at all |
| a stick of chalk | embarrassed | Everything chalk does can be rubbed out |
| a crayon shaving | tired, frustrated | Worn down and still full of colour |
| a scrap of tissue paper | worried | So light it floats off |
| a sticker | disappointed | For when you did well and nobody noticed |
| a scrap of cotton fabric | scared, missing-someone | A corner of something familiar |
| a button | worried, left-out | Kept spare, just in case. Somebody thought ahead |

## The neutral pool

Most feelings have only three or four ingredients tagged for them, and two — `jealous`
and `stuck` — have exactly one. So a potion is **not** built only from ingredients
matching the trouble. It takes one to three matched ingredients and fills the rest from
this neutral pool, which may appear in any potion regardless of the trouble.

This is also how a recipe actually reads: a couple of things chosen *for your feeling*,
and the rest is what makes it a potion.

- half a cup of water *(always present)*
- a spoonful of flour
- three pinches of salt
- a spoonful of sugar
- a spoonful of dry rice
- a drop of food colouring
- a shake of edible glitter
- a dab of washable poster paint
- a length of ribbon
- a piece of string
- a smooth pebble
- a scrap of tissue paper
- a pom-pom

## Starter kit

The set to tick if you only tick one set. Sixteen ingredients: eleven that between them
cover **all seventeen feeling tags**, plus five neutrals so the potion has body and
sparkle. With these in the house, the witch can brew for any trouble a child types.

Kitchen: flour · sugar · salt · lemon juice · baking soda · cocoa powder · dry rice ·
a dried pasta star · a sunflower seed · a breadcrumb · water

Craft drawer: edible glitter · food colouring · a length of ribbon · a piece of string ·
a stick of chalk

Nine of the sixteen are ordinary kitchen staples, which is deliberate — a family should
be able to start today rather than after a shopping trip. The lemon juice and baking soda
are the pair that fizz.

## Approved step verbs

Steps may only use these. No heat, no cutting, no tasting.

`stir` · `sprinkle` · `drop in` · `fold in` · `scatter` · `whisper to` · `count` ·
`swirl` · `tip in` · `rest` · `wait` · `blow on` · `tap` · `place`

## Update Rules

- Adding an entry means checking it against all five rules above. If any is in doubt,
  it does not go in.
- The ingredient data used by the code must match this file exactly. A test asserts it,
  so this file and the code cannot drift apart.
- Removing an entry is always safe. Adding one is the decision that needs care.
