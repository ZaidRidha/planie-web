/* guides.js - the content behind /guides.

   Everything the Guides section renders lives here, so publishing a new piece
   is one object in GUIDES and nothing else: no route to add, no component to
   write, no sitemap edit beyond re-running the generator note at the bottom of
   this file. The array order is the published order (newest first).

   Why a JS module and not MDX/a CMS: this is a CRA app with no content
   pipeline, and the whole point of the section is that it costs nothing to
   keep posting. When the volume justifies it, the shape below (frontmatter +
   typed blocks) maps onto MDX frontmatter or a headless CMS one-to-one.

   Every guide MUST have:
     slug         - URL segment, kebab-case, never changed once published
                    (changing it orphans whatever ranking the page earned)
     title        - the H1
     seoTitle     - <title>; keep under ~60 chars incl. " | Planie"
     description  - meta description, 150-160 chars, written to be clicked
     category     - one of CATEGORIES below
     published    - ISO date; drives the article schema and the listing
     body         - blocks (see the renderer in GuideArticle.jsx)
   Optional:
     updated      - ISO date, shown when a piece is revised
     faqs         - rendered as an FAQ block and emitted as FAQPage schema,
                    which is what wins the "People also ask" style results
     featured     - one guide gets the large slot at the top of the index

   Claims discipline: Planie has not launched. Nothing here quotes a user
   number, a booking figure, a partner count or a launch date, and no guide
   describes an app feature as shipped that is not on the homepage. Where a
   guide talks about what Planie does, it tracks public/marketing/home.html
   and /placements. Advice that is just good planning advice is presented as
   ours to give - that is the honest, and the more useful, version.

   Source is ASCII-only (this repo has documented CP1252/UTF-8 damage - see
   the mojibake in Footer.jsx). */

export const CATEGORIES = ["Planning", "Cities", "For business"];

export const GUIDES = [
  /* ------------------------------------------------------------------ */
  {
    slug: "how-to-plan-a-date-night-in-london",
    title: "How to plan a date night in London without losing the evening to it",
    seoTitle: "How to Plan a Date Night in London | Planie",
    description:
      "A practical method for planning a London date night: pick the neighbourhood first, book the hard part, and leave the last hour empty. Plus the mistakes to avoid.",
    category: "Planning",
    published: "2026-07-15",
    featured: true,
    excerpt:
      "Most people plan a date night by opening five tabs and closing all of them. Here is the order that actually works, and why the last hour should stay empty.",
    body: [
      { type: "p", text: "There is a specific kind of tiredness that comes from planning an evening out in London. You open a list of the city's best restaurants. You open a map. You open the booking page, find nothing at 8pm, and start again. Forty minutes later you have no plan and slightly less enthusiasm for the whole idea than when you started." },
      { type: "p", text: "The problem is almost never a lack of options. London has more good places within one postcode than most people will visit in a year. The problem is that you are trying to solve four things at once - where, what, when, and whether the other person will like it - and every option you look at changes the answer to the other three." },
      { type: "p", text: "So solve them in order. Here is the order." },

      { type: "h2", text: "1. Pick the area before you pick the place" },
      { type: "p", text: "This is the single decision that makes everything after it easier, and it is the one most people make last. Choosing an area collapses hundreds of options into a dozen, gives you a fallback if the first place is full, and means the walk between things is five minutes rather than a Northern line detour." },
      { type: "p", text: "A rough guide to what different parts of London are good at on an evening:" },
      {
        type: "ul",
        items: [
          "Soho and Fitzrovia - the highest density of good food per square metre, and the easiest place to change plans mid-evening. Loud. Very few places take a booking for two at short notice, but walk-in odds are genuinely decent before 6:30pm.",
          "Shoreditch and Hackney - better for a long, slow evening that drifts between two or three places. Weekends get busy early.",
          "Bermondsey and Borough - a real dinner-then-walk area. The riverside stretch back towards Tower Bridge is the rare London walk that improves a date rather than testing it.",
          "Marylebone and Notting Hill - quieter, more conversation-friendly, and the right answer when the point of the evening is actually talking to each other.",
          "South Bank - reliable if you are building the evening around a show or a film, awkward if you are not, because everything is priced for people who are.",
        ],
      },
      { type: "p", text: "If you already know one place you want to go, that place chooses the area and you are done with this step." },

      { type: "h2", text: "2. Book the hard part first, then build around it" },
      { type: "p", text: "In any evening there is exactly one thing with limited supply - the table, the tickets, the 7pm slot. Everything else is flexible. Lock the constrained thing first and let the rest fall into place around it, rather than designing a beautiful sequence and then discovering the restaurant is fully committed until October." },
      { type: "p", text: "A practical note on London tables: the difficult slot is 7:30 to 8:30pm. Moving to 6:30pm or 9pm changes availability dramatically at almost every restaurant in the city, and a 6:30pm booking has the underrated advantage of leaving the entire rest of the evening open." },

      { type: "h2", text: "3. Three things, maximum. Two is usually better" },
      { type: "p", text: "The instinct when you want an evening to be special is to add to it. Drinks, then dinner, then the bar with the view, then the late place. It reads well as a plan and it is exhausting to live through, because every transition is a bill, a coat, a walk and a re-settling." },
      { type: "p", text: "Two anchors and one loose idea is the shape that works: somewhere to start, somewhere to eat, and a vague sense of where you would go if the evening wants to keep going. Which brings us to the part people get wrong most often." },

      { type: "h2", text: "4. Leave the last hour empty" },
      { type: "p", text: "A plan that is booked to the minute cannot respond to the evening actually going well. If dinner is brilliant and you want to sit there for another forty minutes, a 10pm reservation somewhere else stops being a treat and starts being a deadline." },
      { type: "p", text: "Plan properly up to the end of dinner. After that, hold two options loosely - one nearby place you would happily walk to, and the way home - and pick between them based on how the evening feels rather than what you decided on Tuesday." },

      { type: "h2", text: "5. Check the three things that actually ruin evenings" },
      {
        type: "ul",
        items: [
          "Kitchen closing time, not venue closing time. They are frequently ninety minutes apart, and the gap is where a lot of disappointing evenings happen.",
          "Whether it is loud. If the point of the evening is conversation, a place where you have to lean in and repeat yourself is the wrong room no matter how good the food is.",
          "The walk between your two anchors. Under fifteen minutes and it is part of the evening. Over that and it is a commute you scheduled for yourself.",
        ],
      },

      { type: "h2", text: "The five-minute version" },
      {
        type: "steps",
        items: [
          { title: "Pick the area", body: "One area, chosen for the mood you want, not the single best restaurant in London." },
          { title: "Book the constrained thing", body: "The table or the tickets. 6:30pm or 9pm if 8pm is impossible." },
          { title: "Add one thing before it", body: "A bar, a walk, a gallery late-opening. Within ten minutes of the booking." },
          { title: "Stop planning", body: "Hold one nearby option for afterwards, and leave it unbooked." },
        ],
      },

      { type: "h2", text: "Where Planie comes in" },
      { type: "p", text: "Everything above is a method, and doing it by hand takes half an hour. Planie is built to do that half hour for you: you describe the evening you want - the occasion, who it is for, roughly what you want to spend - and it builds the plan in that shape, with real places that fit and are open when you need them." },
      { type: "p", text: "The app is not out yet. If you would like to be told when it is, [the waitlist](/waitlist) is one email and nothing before it. And if the forecast is against you, the same method still works - see [what to do in London when it rains](/guides/what-to-do-in-london-when-it-rains)." },
    ],
    faqs: [
      {
        q: "How far in advance should you book a date night in London?",
        a: "For a specific restaurant on a Friday or Saturday, two to three weeks is realistic. For a weeknight, a few days is usually enough. If you are flexible on time - 6:30pm or after 9pm - most places open up considerably at short notice.",
      },
      {
        q: "What is a good budget for a date night in London?",
        a: "It depends entirely on the area and the format. A drink plus a mid-range dinner for two typically lands between 80 and 140 pounds in central London. Choosing an area is the biggest lever on that number, far more than choosing a cheaper dish at an expensive restaurant.",
      },
      {
        q: "What should you do on a date night in London when it rains?",
        a: "Pick an area where your two anchors are within a few minutes of each other, and swap the outdoor middle section for something indoors - a gallery late-opening, a cinema, a long bar. The rain only ruins a plan that depended on walking between distant points.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "48-hours-in-lisbon",
    title: "48 hours in Lisbon: a plan you can actually walk",
    seoTitle: "48 Hours in Lisbon: A Realistic 2-Day Itinerary | Planie",
    description:
      "A two-day Lisbon itinerary built around the hills rather than against them - what to see, when to go, and the timing mistakes that cost most visitors a morning.",
    category: "Cities",
    published: "2026-07-08",
    excerpt:
      "Most Lisbon itineraries are a list of sights in the wrong order. This one is built around the hills, the light, and the fact that everything shuts on Monday.",
    body: [
      { type: "p", text: "Lisbon punishes bad sequencing more than most cities. It is built on hills, the good viewpoints face specific directions at specific times, and the distance between two neighbourhoods on a map has almost no relationship to how long it takes to walk between them. A list of the ten best things in Lisbon, visited in the order you found them, will cost you a lot of climbing and one of your two mornings." },
      { type: "p", text: "This is the same list, sequenced." },

      { type: "h2", text: "Day one: the old city, downhill" },
      {
        type: "steps",
        items: [
          { title: "Morning - start high, in Alfama", body: "Take a taxi or the 28 tram up rather than walking up. Begin near Sao Jorge Castle and work downwards through Alfama's lanes. Going down through Alfama is a pleasure; going up through it is a workout you did not plan for." },
          { title: "Late morning - Miradouro das Portas do Sol", body: "The classic terracotta-rooftop view. Morning light is behind you here, which is the difference between the photograph you wanted and a grey one." },
          { title: "Lunch - Baixa, at the bottom", body: "You will arrive at the flat grid part of the city around lunchtime, which is exactly right. Eat before 1pm or after 2:30pm; the middle hour is when every table in Baixa is committed." },
          { title: "Afternoon - Chiado and Bairro Alto", body: "One climb, and a short one. Bookshops, the ruined Carmo Convent, and a neighbourhood that gets steadily better as the afternoon goes on." },
          { title: "Sunset - a west-facing miradouro", body: "Sao Pedro de Alcantara or Santa Catarina. Arrive forty-five minutes before sunset, not at sunset, unless standing behind three rows of people is the experience you were after." },
          { title: "Evening - dinner in Bairro Alto or Principe Real", body: "You are already there. Bairro Alto gets loud after 10pm, which is either the point or the reason to eat earlier." },
        ],
      },

      { type: "h2", text: "Day two: Belem, then whatever you liked most" },
      { type: "p", text: "Belem is a tram or a short taxi west along the river, and it holds three of the things people come to Lisbon for - the Jeronimos Monastery, the Tower, and the original pasteis de nata - within a fifteen-minute walk of each other. It is also the single most schedulable part of the trip, which makes it the right thing to do on the day you have less energy." },
      {
        type: "ul",
        items: [
          "Go early. The monastery queue is materially shorter before 10am and materially worse from 11am onwards.",
          "The nata queue at Pasteis de Belem moves much faster than it looks, and the sit-down room inside is usually emptier than the takeaway line outside.",
          "Do the monastery first and the tower second. The tower is outdoors and forgiving of a warmer hour; the monastery is not forgiving of a crowded one.",
        ],
      },
      { type: "p", text: "That is a half-day. What you do with the second half depends on what day one told you about your own trip - and this is where a good plan beats a full one. If the viewpoints were the highlight, take the 28 tram end to end. If it was the food, book a proper long lunch. If it was the light on the water, Cais do Sodre to Cacilhas on the ferry costs almost nothing and gives you the city from the other side." },

      { type: "h2", text: "The timing mistakes that cost people a morning" },
      {
        type: "ul",
        items: [
          "Monday. Many Lisbon museums close on Mondays, including some of the ones people plan their trip around. Check before you build the day, not after.",
          "Sintra as a day trip inside a 48-hour visit. It is genuinely worth seeing and it will eat one of your two days entirely. With only 48 hours, choosing Lisbon over Sintra is usually the better trade.",
          "Walking uphill by accident. Before committing to a route, look at whether it climbs. The funiculars and the Santa Justa lift exist for a reason.",
          "Assuming a 15-minute map distance is a 15-minute walk. In the old city, add half again.",
        ],
      },

      { type: "h2", text: "How to adapt this" },
      { type: "p", text: "The structure - high to low, book the constrained thing, one anchor per half-day, keep the second afternoon loose - is the part worth copying. The specific stops are interchangeable, and they should be: the best version of your 48 hours depends on whether you are travelling as a couple, with friends, or with someone who will not enjoy a fourth viewpoint." },
      { type: "p", text: "That is the problem Planie is built for. You describe the trip - the city, the days, who is coming, the pace you want - and it builds the plan in this shape rather than handing you a list to sequence yourself. It is not out yet; [the waitlist](/waitlist) will tell you when it is." },
      { type: "p", text: "If the trip involves more than two of you, the harder problem is agreement rather than sequencing - that is covered in [how to plan a group trip when nobody will make a decision](/guides/how-to-plan-a-group-trip)." },
    ],
    faqs: [
      {
        q: "Is 48 hours enough for Lisbon?",
        a: "For the city itself, yes - two days covers Alfama, Baixa, Chiado, Bairro Alto and Belem at a pace that still leaves time to sit down. It is not enough to add Sintra without cutting something significant from Lisbon.",
      },
      {
        q: "What is the best area to stay in Lisbon for a short trip?",
        a: "Chiado or Baixa. Both are central, flat enough to return to at the end of a long day, and within walking distance of most of a 48-hour itinerary. Alfama is beautiful to visit and tiring to come home to on a hill at midnight.",
      },
      {
        q: "Do you need to book Lisbon attractions in advance?",
        a: "The Jeronimos Monastery and Sao Jorge Castle are the two where a timed ticket genuinely saves you queueing, especially in summer. Most other things in this itinerary do not need booking, though restaurants at peak hours do.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "how-to-plan-a-group-trip",
    title: "How to plan a group trip when nobody will make a decision",
    seoTitle: "How to Plan a Group Trip Everyone Agrees On | Planie",
    description:
      "Group trips fail on decisions, not budgets. A method for getting six people from a group chat to a booked trip - deadlines, defaults, and the one person who decides.",
    category: "Planning",
    published: "2026-06-24",
    excerpt:
      "Group trips do not fall apart over money. They fall apart because a decision that needed one person waited for six. Here is how to stop that.",
    body: [
      { type: "p", text: "Every group trip has the same failure mode. Someone suggests it. Everyone is enthusiastic. A group chat appears. Three weeks later the chat contains eleven suggestions, two links to flights that have since gone up, and no dates." },
      { type: "p", text: "It is easy to blame this on people being flaky. It is more accurate to blame it on structure: you have created a system where every decision requires unanimous agreement from people who are not in the same room and have different tolerances for spending money. That system has no natural way to reach a conclusion, so it does not reach one." },
      { type: "p", text: "Fix the structure and the same six people will book a trip in a week." },

      { type: "h2", text: "1. One person decides. Everyone else vetoes" },
      { type: "p", text: "This is the whole thing, really. Group decisions do not work; group vetoes do. Appoint one person to make the call on each area - dates, destination, accommodation, the one big activity - and let everyone else respond only if it genuinely does not work for them." },
      { type: "p", text: "The difference between \"where should we go?\" and \"I am going to book Porto for the 12th to the 15th unless someone says no by Friday\" is the difference between a trip that happens and one that does not. The second question can be answered in ten seconds by someone on a bus." },

      { type: "h2", text: "2. Lock dates before anything else" },
      { type: "p", text: "Dates are the only truly hard constraint - everything else has an alternative, and nothing else can be booked without them. Get dates agreed while enthusiasm is still high, and get them agreed as a range with a deadline attached, not an open question." },
      { type: "p", text: "A practical version: put two or three date options up, give people 48 hours, and treat silence as a yes. People who care will answer. People who do not answer did not care." },

      { type: "h2", text: "3. Agree the money number out loud, early" },
      { type: "p", text: "The unspoken part of most group trips is that people have different budgets and nobody wants to be the one who says so. This surfaces later as vague reluctance about specific plans, which is much harder to work with than a number." },
      { type: "p", text: "Ask for a rough total per person including flights and accommodation, before you look at options. It is a slightly awkward message to send and it removes most of the friction from every decision that follows." },

      { type: "h2", text: "4. Plan one thing per day, not five" },
      { type: "p", text: "The larger the group, the longer everything takes. Six people cannot leave a building in under twenty minutes, cannot agree on lunch quickly, and cannot all be ready at 9am. A schedule with four fixed items per day will start slipping by mid-morning on day one and be openly ignored by day two." },
      { type: "p", text: "One anchor per day - the thing you actually came for, booked and non-negotiable - plus a shortlist of nearby options that anybody can propose in the moment. That structure survives contact with a group. A full itinerary does not." },

      { type: "h2", text: "5. Build in a way to split up" },
      { type: "p", text: "The healthiest group trips have an explicit, stated permission to not do everything together. Say it early, at the planning stage, when it sounds like good sense rather than at 11am on day two when it sounds like a complaint." },
      { type: "p", text: "The practical form of this is choosing accommodation and areas where splitting is easy - somewhere central, with a clear place to meet again - rather than somewhere remote where any split becomes a logistics problem." },

      { type: "h2", text: "The message that unsticks a stalled group chat" },
      { type: "p", text: "If you take one thing from this: the message that restarts a dead trip is not \"so are we still doing this?\". It is a specific proposal with a deadline and a default." },
      {
        type: "quote",
        text: "\"Porto, 12-15 October, roughly 350 each including flights. I'll book the apartment Friday morning unless anyone says no.\"",
      },
      { type: "p", text: "That message has a destination, dates, a number, an owner and a deadline. It can be answered instantly. It is also, notably, not asking for permission - which is why it works." },

      { type: "h2", text: "Where Planie fits" },
      { type: "p", text: "Planie is built around the idea that a plan should come from a person's actual situation - who is coming, what the occasion is, what the group is in the mood for - rather than from a ranked list of everything in a city. For a group, that means a plan with one anchor per day and real alternatives around it, which is exactly the shape that survives six people." },
      { type: "p", text: "It is not out yet. [The waitlist](/waitlist) is one email, on the day it launches - and if your group has landed on a city already, [48 hours in Lisbon](/guides/48-hours-in-lisbon) shows the one-anchor-per-half-day shape in practice." },
    ],
    faqs: [
      {
        q: "How do you decide where to go on a group trip?",
        a: "Give one person the decision and everyone else a veto with a deadline. Open questions to a group chat do not converge; a specific proposal - destination, dates, rough cost, a date you will book on - does.",
      },
      {
        q: "How far in advance should you plan a group trip?",
        a: "Lock dates two to three months out for a long weekend abroad, more if flights are seasonal. The dates are the bottleneck: once they are fixed, everything else can be arranged in a fortnight.",
      },
      {
        q: "How many activities should you plan per day on a group trip?",
        a: "One booked anchor per day, plus a loose shortlist. Larger groups move slower than anyone expects, and a schedule with four fixed items will be abandoned by the second morning.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ai-trip-planning-what-it-gets-wrong",
    title: "Using AI to plan a trip: what it is good at, and where it still gets things wrong",
    seoTitle: "AI Trip Planning: What It Gets Right and Wrong | Planie",
    description:
      "A clear-eyed guide to planning travel with AI - the four things it does genuinely well, the four failure modes to check for, and how to prompt it properly.",
    category: "Planning",
    published: "2026-06-10",
    excerpt:
      "AI is very good at structuring a trip and unreliable about the facts inside it. Knowing which is which turns it from a gimmick into the most useful planning tool you have.",
    body: [
      { type: "p", text: "Asking a chatbot to plan your holiday produces something impressive in about eight seconds: a day-by-day itinerary, neatly formatted, confident, with times. It is genuinely useful. It also, reliably, contains at least one restaurant that closed two years ago and one walk that is four times longer than stated." },
      { type: "p", text: "Both of those things are true at once, and the reason is the same. A language model is excellent at structure - the shape of a good day, the sensible order of things, the fact that you should not schedule two museums back to back - and unreliable about specific, current facts, because it is producing plausible text rather than looking anything up." },
      { type: "p", text: "Use it for the first thing. Verify the second." },

      { type: "h2", text: "What AI is genuinely good at" },
      {
        type: "ul",
        items: [
          "Sequencing. Given a list of things you want to do, it will order them sensibly by geography and time of day, which is the tedious part of planning and the part people get wrong.",
          "Adapting a plan to constraints. \"The same three days but with a four-year-old and no more than an hour of walking per day\" is a genuinely hard rewrite that it handles well.",
          "Being asked for less. \"Give me one thing to do on Tuesday afternoon near Alfama\" gets a better answer than \"plan my trip\", because the smaller the scope the less there is to invent.",
          "Explaining trade-offs. Ask why it chose one area over another and the reasoning is usually sound, even when a specific recommendation inside it is not.",
        ],
      },

      { type: "h2", text: "The four failure modes to check for" },
      {
        type: "steps",
        items: [
          { title: "Places that no longer exist", body: "The most common and most costly error. Any restaurant, bar or venue in an AI itinerary needs one search to confirm it is open before it goes in your plan." },
          { title: "Confident wrong hours", body: "Opening times and closing days are exactly the kind of specific fact models get wrong, and Monday closures ruin more days than anything else on this list." },
          { title: "Distances that do not survive a map", body: "\"A short walk\" between two points can mean forty minutes uphill. Check the two longest hops of any day against a real map." },
          { title: "The generic top ten", body: "Ask for a plan without saying who it is for and you will get the same plan everyone gets - the famous things, in a reasonable order, with nothing in it that is actually for you." },
        ],
      },

      { type: "h2", text: "How to prompt it so the answer is worth having" },
      { type: "p", text: "The quality of an AI itinerary tracks almost entirely with how much of your actual situation you put into the question. Most people give it a city and a number of days, which is not enough information to produce anything but the average answer." },
      { type: "p", text: "Give it, at minimum: who is going, what the occasion is, your pace, your budget, and one thing you specifically do not want. That last one does more work than anything else - \"nothing that needs booking three weeks ahead\" or \"no long walks\" or \"we have done all the obvious things before\" is what moves it off the generic list." },
      { type: "p", text: "Then ask it to justify each choice in one line. It is much harder to invent a plausible reason for a specific place than to invent the place, so the reasoning column is a surprisingly good lie detector." },

      { type: "h2", text: "The structural problem nobody prompts their way out of" },
      { type: "p", text: "There is a limit to how much of this is a prompting problem. A general-purpose chatbot has no live connection to whether a place is open tonight, whether it takes bookings, whether it has a table at 8pm, or whether it is any good now rather than when its training data was assembled. You can ask better questions; you cannot ask it to know something it does not have." },
      { type: "p", text: "That gap - between a model that understands what a good evening looks like and a model that knows what is actually available tonight - is the entire reason Planie exists." },

      { type: "h2", text: "How Planie approaches it differently" },
      { type: "p", text: "Planie starts from the same place a good prompt does: the occasion, the group, the vibe, the moment. The difference is what it plans with. Venues on Planie are real listings, reviewed by a person before they go live, with their own hours, price range and occasions attached - so the plan you get is built from things that exist and are open, not from things the model remembers." },
      { type: "p", text: "It also means a place appears in your plan because it fits, not because someone paid for it to be there. Partners can raise their visibility, but no budget puts a venue into a plan it does not belong in. You can read exactly how that works on [our placements page](/placements)." },
      { type: "p", text: "The app is not out yet. [Join the waitlist](/waitlist) and you will get one email, the day it is. For the method a good prompt is imitating, start with [how to plan a date night in London](/guides/how-to-plan-a-date-night-in-london)." },
    ],
    faqs: [
      {
        q: "Is AI good at planning trips?",
        a: "It is good at the structure of a trip - sequencing, pacing, adapting a plan to constraints - and unreliable about specific current facts like opening hours, whether a venue still exists, and real walking distances. Use it for the shape and verify the details.",
      },
      {
        q: "What is the best way to prompt AI for a travel itinerary?",
        a: "Include who is travelling, the occasion, your pace, your budget, and one specific thing you do not want. Then ask it to give a one-line reason for each choice - the reasoning is easier to sanity-check than the recommendations themselves.",
      },
      {
        q: "Why do AI itineraries recommend places that have closed?",
        a: "A general-purpose language model generates plausible text from training data rather than looking up live information. It has no way to know whether a restaurant closed after that data was assembled, so it recommends it with the same confidence as anything else.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "what-to-do-in-london-when-it-rains",
    title: "What to do in London when it rains (and how to plan around it)",
    seoTitle: "What to Do in London When It Rains | Planie",
    description:
      "Rain only ruins plans that depend on walking between distant points. How to build a London day that works wet or dry, plus areas where everything is indoors and close.",
    category: "Cities",
    published: "2026-05-27",
    excerpt:
      "Rain does not ruin a London day. It ruins a London day whose parts were twenty minutes apart. The fix is structural, and you can apply it before you know the forecast.",
    body: [
      { type: "p", text: "The standard advice for a rainy day in London is a list of indoor attractions. It is not wrong, but it is solving the wrong problem, because the thing that actually goes wrong on a wet day is rarely that you are stuck outside a museum. It is that your day had four parts in four different places, and rain turned each of the three gaps between them into a miserable negotiation with an umbrella and the Central line." },
      { type: "p", text: "Fix the gaps and the rain stops mattering nearly as much." },

      { type: "h2", text: "Plan a dense day, not an indoor one" },
      { type: "p", text: "A rain-proof London day has all of its parts inside one small area, ideally within five minutes of each other, with at least one of them being somewhere you would happily sit for two hours if the weather got worse. That is a structural property of the plan, and you can build it before you have any idea what the forecast will be." },
      { type: "p", text: "The areas where this is easiest:" },
      {
        type: "ul",
        items: [
          "South Kensington - three major museums within a few minutes of each other, and a tunnel from the station that means you can arrive without going outside at all. The single most weather-proof square kilometre in the city.",
          "Bloomsbury - the British Museum plus a dense ring of cafes, bookshops and pubs. Everything is walkable in under ten minutes.",
          "Bankside - Tate Modern, Borough Market, the Globe, all along one covered-ish stretch of river. Market plus gallery is a full day in itself.",
          "Covent Garden and Seven Dials - the actual market building is covered, and the surrounding streets have the highest density of small shops and places to sit in central London.",
          "Soho - not covered, but so dense that no walk between two things is longer than four minutes.",
        ],
      },

      { type: "h2", text: "The three-part wet day that always works" },
      {
        type: "steps",
        items: [
          { title: "A long indoor anchor", body: "A museum, a gallery, a big market. Two to three hours, and free entry at most of London's major museums means there is no cost to cutting it short or staying longer." },
          { title: "A proper sit-down lunch", body: "On a wet day this stops being refuelling and becomes part of the plan. Book it. A ninety-minute lunch is a much better use of rain than a rushed one." },
          { title: "One small thing nearby", body: "A cinema, a bookshop, a pub with actual chairs. Chosen for being close, not for being remarkable." },
        ],
      },
      { type: "p", text: "That is a genuinely good day out, and it is the same day whether it rains or not - which is the point. You are not building a contingency; you are building a plan that does not have a weather dependency in the first place." },

      { type: "h2", text: "Underrated wet-weather London" },
      {
        type: "ul",
        items: [
          "Museum late openings. Several major museums stay open one evening a week, and a wet Friday evening is the emptiest a London museum ever gets.",
          "Independent cinemas. An afternoon film is one of the few plans that is genuinely better in bad weather.",
          "Hotel bars. Frequently open to non-guests, almost always quiet mid-afternoon, and built for sitting in for a long time.",
          "The river bus. Covered, warm, and the best sightseeing in London on a grey day precisely because everyone else has gone indoors.",
        ],
      },

      { type: "h2", text: "What to check before you commit" },
      {
        type: "ul",
        items: [
          "Whether your anchor closes on a Monday, or needs a free timed ticket in advance - several London museums do.",
          "The longest walk in your day. If it is over ten minutes, find a way to shorten it or accept that it is the part that will go wrong.",
          "Whether your lunch place takes bookings. On a wet Saturday, every indoor table in a tourist area is spoken for by 12:30pm.",
        ],
      },

      { type: "h2", text: "Planning this without doing it yourself" },
      { type: "p", text: "Building a dense, one-area day by hand means checking hours, distances and bookings across a handful of places. That is exactly the work Planie is designed to take off you: you describe the day you want and the constraints you are under, and it builds a plan that fits them - real places, right area, open when you need them." },
      { type: "p", text: "Not out yet. [The waitlist](/waitlist) is one email on launch day, and nothing before it. For the evening version of the same method, see [how to plan a date night in London](/guides/how-to-plan-a-date-night-in-london)." },
    ],
    faqs: [
      {
        q: "What is the best area of London for a rainy day?",
        a: "South Kensington. Three major museums sit within a few minutes of each other, and a pedestrian tunnel connects the Underground station to them, so you can spend most of the day without going outside.",
      },
      {
        q: "Are London museums free?",
        a: "Most of the major national museums - the British Museum, the National Gallery, the Natural History Museum, the V&A, Tate Modern - are free to enter, with charges for some special exhibitions. Some ask you to book a free timed slot in advance.",
      },
      {
        q: "How do you plan a London day around bad weather?",
        a: "Keep every part of the day inside one small area so no walk between them is longer than about ten minutes, and make one part something you would happily sit in for two hours. That plan works in any weather, so you do not need the forecast to commit to it.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "how-restaurants-get-recommended-by-ai",
    title: "How restaurants get recommended by AI - and what to do about it now",
    seoTitle: "How Restaurants Get Recommended by AI | Planie",
    description:
      "People are starting to ask AI where to eat. What that changes for restaurants, why it is not the same as SEO, and the practical steps worth taking before it matters.",
    category: "For business",
    published: "2026-05-13",
    excerpt:
      "Search sent people to a list of restaurants. AI sends them to one. That is a much sharper distribution channel, and almost nobody is set up for it yet.",
    body: [
      { type: "p", text: "For twenty years, the way a restaurant got found online was a list. Someone searched, got ten results, and chose from them. Ranking third was worth real money because third of ten still meant being seen." },
      { type: "p", text: "Increasingly, people are not getting a list. They are asking an assistant where to eat tonight, near here, for this occasion, at this price - and getting two or three answers with reasons attached. There is no page two. Either you are one of the answers or you are not in the conversation at all." },
      { type: "p", text: "That is a meaningfully different game to search, and it rewards different things." },

      { type: "h2", text: "Why this is not just SEO again" },
      { type: "p", text: "Search engines match a query to pages. Assistants answer a question, which means they need to know things about you rather than find documents mentioning you. The unit of visibility has moved from the page to the fact." },
      { type: "p", text: "In practice, that changes what is worth having:" },
      {
        type: "ul",
        items: [
          "Explicit, machine-readable facts about your venue - cuisine, price range, opening hours, neighbourhood, what occasions you suit - beat well-written prose about atmosphere.",
          "Consistency across sources matters more than volume. If your hours differ between your site, your Google listing and three directories, a model has no way to decide which is true, and the safest thing it can do is recommend someone else.",
          "Being described in the language people actually ask in - \"good for a first date\", \"quiet enough to talk\", \"walk-ins welcome\" - is what gets you matched to those questions. Nobody asks for \"contemporary European small plates\".",
          "Structured data on your own site (schema.org Restaurant markup, with hours, price range and menu) is the cheapest single thing you can do, and most independent restaurants still do not have it.",
        ],
      },

      { type: "h2", text: "The five things worth doing this month" },
      {
        type: "steps",
        items: [
          { title: "Fix your hours everywhere", body: "Your own site, Google Business Profile, and every directory that still lists you. Wrong hours are the fastest way to be filtered out of a real-time recommendation." },
          { title: "Add structured data to your site", body: "Restaurant schema with address, hours, price range, cuisine and a link to your menu. It is a one-off job for whoever built your site, and it makes your facts unambiguous." },
          { title: "Write the occasion, not the concept", body: "Somewhere on your site, say plainly who you are good for: date nights, big groups, solo lunch, before a show, kids. This is the vocabulary the questions are asked in." },
          { title: "Make the menu readable, not a PDF", body: "A menu locked in a PDF or an image is close to invisible to anything that reads the web. Plain text on a page." },
          { title: "Keep your reviews current", body: "Recency carries weight. A steady trickle of recent reviews is worth more than a large number of old ones." },
        ],
      },

      { type: "h2", text: "What Planie is building here" },
      { type: "p", text: "Planie is a planning app: it builds someone's actual evening or trip, then decides which few places belong in it. That means a venue on Planie is not competing for a slot on a results page - it is being chosen for a specific person's specific moment, matched on occasion, vibe, time and distance." },
      { type: "p", text: "Every listing is reviewed by a person before it goes live, and edits are re-checked, so the facts behind a recommendation are real ones. Partner and Featured tiers raise a venue's baseline visibility and campaign slots put it in front of a city at the right moment - but a boosted listing still has to clear the bar. Money can move you up; it cannot put you somewhere you do not fit. That rule is the reason being picked means anything." },
      { type: "p", text: "Generative Engine Optimisation - structuring your venue so that assistants beyond Planie understand and recommend it - is the partner layer we are building next. [Our placements page](/placements) sets out how the whole thing works, and [partner sign-up](/partners/login) is open now." },
      { type: "p", text: "It is also worth reading the other side of this: [what AI gets right and wrong when it plans a trip](/guides/ai-trip-planning-what-it-gets-wrong) is the same problem seen from the diner's chair." },
    ],
    faqs: [
      {
        q: "What is GEO, or Generative Engine Optimisation?",
        a: "It is the practice of structuring information about a business so that AI assistants can understand, quote and recommend it - the equivalent of SEO for a world where people ask an assistant a question instead of scanning a results page.",
      },
      {
        q: "How do AI assistants decide which restaurants to recommend?",
        a: "They draw on what they can read and verify about a venue: consistent hours and location data, structured markup, menus in readable text, recent reviews, and descriptions that match how people phrase their questions. Contradictory or missing facts make a venue a risky answer, so it gets left out.",
      },
      {
        q: "Does paying for placement on Planie guarantee a recommendation?",
        a: "No. Partner and Featured tiers raise baseline visibility and campaign slots buy exposure at particular moments, but a listing still has to fit the plan - right occasion, vibe, time and distance. No budget places a venue somewhere it does not belong.",
      },
    ],
  },
];

/* ---- lookup helpers ------------------------------------------------- */

export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);

/* Words per minute is a convention rather than a measurement; 200 is the
   usual figure for considered non-fiction. Rounded up so nothing reads
   "0 min". */
export function readingTime(guide) {
  const words = guide.body.reduce((n, b) => {
    if (b.text) return n + b.text.split(/\s+/).length;
    if (b.items) {
      return n + b.items.reduce(
        (m, it) => m + (typeof it === "string" ? it : `${it.title} ${it.body}`).split(/\s+/).length,
        0
      );
    }
    return n;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}

/* "15 July 2026" - written out rather than numeric, because 07/08 is an
   ambiguous date to half the internet. */
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* Two related guides for the foot of an article: same category first (that is
   the reader's demonstrated interest), then whatever is newest, never itself. */
export function relatedGuides(guide, count = 2) {
  const others = GUIDES.filter((g) => g.slug !== guide.slug);
  const sameCategory = others.filter((g) => g.category === guide.category);
  return [...sameCategory, ...others.filter((g) => g.category !== guide.category)].slice(0, count);
}

/* When you add a guide, add its URL to public/sitemap.xml. It is a static
   file on purpose - there is no server here to generate one - and a guide
   missing from it is a guide search engines find late. */
