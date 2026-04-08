import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "changeme123";

async function upsertPerson(
  name: string,
  category: string,
  data: { title?: string; bio?: string; photoUrl?: string; sortOrder?: number }
) {
  const existing = await prisma.person.findFirst({
    where: { name, category },
  });
  if (existing) {
    return prisma.person.update({
      where: { id: existing.id },
      data: {
        title: data.title ?? null,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }
  return prisma.person.create({
    data: {
      name,
      category,
      title: data.title ?? null,
      bio: data.bio ?? null,
      photoUrl: data.photoUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function upsertPartner(
  name: string,
  data: { logoUrl?: string | null; link?: string | null; sortOrder?: number }
) {
  const existing = await prisma.partner.findFirst({ where: { name } });
  if (existing) {
    return prisma.partner.update({
      where: { id: existing.id },
      data: {
        logoUrl: data.logoUrl ?? null,
        link: data.link ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }
  return prisma.partner.create({
    data: {
      name,
      logoUrl: data.logoUrl ?? null,
      link: data.link ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function upsertPublication(
  title: string,
  data: {
    description?: string | null;
    link?: string | null;
    category: string;
    sortOrder?: number;
  }
) {
  const existing = await prisma.publication.findFirst({ where: { title } });
  if (existing) {
    return prisma.publication.update({
      where: { id: existing.id },
      data: {
        description: data.description ?? null,
        link: data.link ?? null,
        category: data.category,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }
  return prisma.publication.create({
    data: {
      title,
      description: data.description ?? null,
      link: data.link ?? null,
      category: data.category,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function upsertVideo(
  title: string,
  data: { youtubeUrl: string; sortOrder?: number }
) {
  const existing = await prisma.video.findFirst({ where: { title } });
  if (existing) {
    return prisma.video.update({
      where: { id: existing.id },
      data: { youtubeUrl: data.youtubeUrl, sortOrder: data.sortOrder ?? 0 },
    });
  }
  return prisma.video.create({
    data: {
      title,
      youtubeUrl: data.youtubeUrl,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@humancomputation.org" },
    update: {
      name: "HCI Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@humancomputation.org",
      name: "HCI Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await upsertPerson("Pietro Michelucci", "core", {
    title: "Executive Director",
    sortOrder: 0,
  });
  await upsertPerson("Pietro Michelucci", "board", {
    title: "Executive Director",
    sortOrder: 0,
  });
  await upsertPerson("Ravish Dussaruth", "core", {
    title: "Lead Software Developer",
    sortOrder: 1,
  });
  await upsertPerson("Eglė Marija Ramanauskaitė", "core", {
    title: "Citizen Science Coordinator",
    sortOrder: 2,
  });
  await upsertPerson("Elizabeth Tyson", "core", {
    title: "Strategic Advisor",
    sortOrder: 3,
  });
  await upsertPerson("Libuše Hannah", "core", {
    sortOrder: 4,
  });
  await upsertPerson(
    "Chris B. Schaffer",
    "faculty",
    {
      title:
        "External Professor, Associate Professor, Cornell University, Department of Biomedical Engineering",
      sortOrder: 0,
    }
  );
  await upsertPerson(
    "Eglė M. Ramanauskaitė",
    "faculty",
    {
      title:
        "External Professor, Citizen Science Coordinator, Human Computation Institute",
      sortOrder: 1,
    }
  );
  await upsertPerson(
    "Matjaž Perc",
    "faculty",
    {
      title: "External Professor, Professor of Physics, University of Maribor, Slovenia",
      sortOrder: 2,
    }
  );
  await upsertPerson(
    "Darlene Cavalier",
    "faculty",
    {
      title:
        "External Professor, Founding Director SciStarter, Professor of Practice, Arizona State University",
      sortOrder: 3,
    }
  );

  const projects = [
    {
      slug: "stall-catchers",
      name: "Stall Catchers",
      description:
        "Citizen science game that crowdsources analysis of blood vessel movies to accelerate Alzheimer’s research with Cornell’s Schaffer–Nishimura Lab.",
      sortOrder: 0,
    },
    {
      slug: "eyesonalz",
      name: "EyesOnALZ",
      description:
        "Platform and partnership initiative turning complex laboratory analysis into engaging games so the public can contribute to Alzheimer’s research.",
      sortOrder: 1,
    },
    {
      slug: "dream-catchers",
      name: "Dream Catchers",
      description:
        "Online game using crowdsourcing to advance Sudden Infant Death Syndrome (SIDS) research while spreading awareness of safe sleep guidelines.",
      sortOrder: 2,
    },
    {
      slug: "crowdmeter",
      name: "CrowdMeter",
      description:
        "App and research effort exploring how shared crowd signals can help people make informed choices about crowded places and public health.",
      sortOrder: 3,
    },
    {
      slug: "civium",
      name: "Civium",
      description:
        "Integration platform concept for sustainable human computation—connecting stakeholders, tasks, and outcomes across participatory systems.",
      sortOrder: 4,
    },
    {
      slug: "crowd2map",
      name: "Crowd2Map Tanzania",
      description:
        "Crowdsourced mapping initiative to improve OpenStreetMap coverage in rural Tanzania, supporting development and community safety efforts.",
      sortOrder: 5,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        sortOrder: p.sortOrder,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        sortOrder: p.sortOrder,
      },
    });
  }

  await upsertPartner("Microsoft", {
    link: "https://www.microsoft.com",
    sortOrder: 0,
  });
  await upsertPartner("SciStarter", {
    link: "https://scistarter.org",
    sortOrder: 1,
  });

  await upsertPublication("Springer Handbook of Human Computation", {
    category: "book",
    link: "https://link.springer.com/referencework/10.1007/978-1-4614-8806-4",
    sortOrder: 0,
  });
  await upsertPublication("Human Computation – a transdisciplinary journal", {
    category: "journal",
    link: "https://hc-journal.org",
    sortOrder: 0,
  });

  await upsertVideo("The Conundrum of Purpose in Collective Intelligence Systems", {
    youtubeUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    sortOrder: 0,
  });
  await upsertVideo("Michael Bernstein: Crowd-powered systems", {
    youtubeUrl: "https://www.youtube.com/embed/9IICXFUP6MM",
    sortOrder: 1,
  });
  await upsertVideo("Internet Hall of Fame 2014: Christina Engelbart", {
    youtubeUrl: "https://www.youtube.com/embed/M7lc1UVf-VE",
    sortOrder: 2,
  });
  await upsertVideo("Chris Schaffer Science Talk", {
    youtubeUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    sortOrder: 3,
  });

  const siteSettings: { key: string; value: string }[] = [
    { key: "contact_address", value: "Ithaca, NY" },
    { key: "contact_phone", value: "+1(607)319-3119" },
    { key: "contact_email", value: "info@humancomputation.org" },
    { key: "social_twitter", value: "https://twitter.com/hcinst" },
    {
      key: "social_facebook",
      value: "https://www.facebook.com/humancomputationinstitute",
    },
    {
      key: "social_youtube",
      value: "https://www.youtube.com/channel/UCoc_fLZ6NRqyJGeAVkev8Jg",
    },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  const stallCatchersBody = `<p>Stall Catchers is a citizen science game, developed by the Human Computation Institute as part of the EyesOnALZ project in 2016.</p>
<p>Funded by a grant from the BrightFocus Foundation, HCI has been collaborating with Cornell, Berkeley, Princeton, WiredDifferently, and SciStarter to develop a platform for crowdsourcing the AD research being done at Cornell University.</p>
<p><a href="http://stallcatchers.com/">Stall Catchers</a> allows participants to look at movies of real blood vessels in mouse brains, and search for &ldquo;stalls&rdquo; &ndash; clogged capillaries where blood is no longer flowing. By &ldquo;catching stalls&rdquo; participants can build up their score, level up and compete in the game leaderboard, as well as receive digital badges for their various achievements in the game.</p>
<p>Most importantly, the game will enable the crowdsourcing of promising Alzheimer&rsquo;s research at the <a href="https://snlab.bme.cornell.edu/">Schaffer-Nishimura Laboratory</a> (Cornell Dept. of Biomedical Engineering). There, recent breakthroughs have been made in understanding the role of reduced brain blood flow in AD, and reversing some of the Alzheimer&rsquo;s symptoms, such as memory loss and mood changes, by targeting blood vessel stalls.</p>
<p>Stall Catchers has been built on the existing platform of stardust@home &ndash; one of the first volunteer thinking projects. Just as aerogel images were being studied in stardust@home to look for interstellar dust particles, in Stall Catchers a &ldquo;Virtual Microscope&rdquo; plays back vessel movies &ndash; images of consecutive layers of a live mouse brain. Participants analyze one microscopic vessel at the time, looking for signs of stalls.</p>
<p>The game, launched Oct. 1, 2016, is expected to remove the current analytic bottleneck of blood flow analysis in AD, and accelerate the research towards promising AD treatment candidates.</p>`;

  const crowd2mapBody = `<p><a href="https://crowd2map.wordpress.com/">Crowd2Map Tanzania</a> is a crowdsourced initiative aimed at creating a comprehensive map of rural Tanzania, including detailed depictions of all of its villages, roads and public resources (such as schools, shops, offices etc.) in OpenStreetMap, to fight female genital mutilation (FGM) and foster development in the region.</p>
<p>Crowd2Map Tanzania was co-created by the <a href="http://www.tanzdevtrust.org/">Tanzania Development Trust</a> and the Human Computation Institute, and is now run by the Tanzania Development Trust.</p>`;

  const eyesPbsBody = `<p>First episode of <em>The Crowd and The Cloud</em>: <a href="http://eyesonalz.com/">EyesOnALZ</a>, a project led by the Human Computation Institute, will be among four projects featured in the premiere episode of <a href="http://crowdandcloud.org/">The Crowd and The Cloud</a>, a National Public Television mini-series by the creators of <em>Cosmos</em>.</p>
<p>By turning complex laboratory analysis into a game (<a href="http://stallcatchers.com/">Stall Catchers</a>) that anyone can play, EyesOnALZ has made it possible to accelerate Cornell&rsquo;s promising Alzheimer&rsquo;s disease research to compress decades of inquiry into just a few years.</p>`;

  const crowdsourcingBody = `<p>Human Computation Institute is leading an initiative to develop an online Citizen Science platform that will enable the general public to contribute directly to Alzheimer&rsquo;s Disease research and possibly lead to a new treatment target in just a few years.</p>
<p>It has long been known that reduced blood flow in the brain is associated with Alzheimer&rsquo;s Disease and other forms of dementia. However, new imaging techniques have enabled our Cornell-based collaborators to make important discoveries about the mechanisms that underlie this reduced blood flow.</p>
<p>These findings are suggestive of a new treatment approach that could reduce cognitive symptoms and halt disease progression. However, arriving at a specific treatment target based on these findings requires additional research. Unfortunately, the data curation required to advance these studies is very labor-intensive, such that one hour&rsquo;s worth of collected data requires a week&rsquo;s worth of annotation by laboratory personnel. Indeed, the curation aspect of the analysis is so time consuming that to complete the studies necessary for identifying a drug target could take decades.</p>
<p>Fortunately, accurate curation of the data, though still impossible for machines, involves perceptual tasks that are very easy for humans. We aim to address the analytic bottleneck via crowdsourcing using a divide-and-conquer strategy. The curation tasks in this research map closely to the tasks used in two existing citizen science platforms: <a href="http://stardustathome.ssl.berkeley.edu/">stardust@home</a> and <a href="https://eyewire.org/">EyeWire</a>, both of which have enabled discoveries reported in the journal <em>Science</em>. In direct collaboration with the creators of these highly successful citizen science platforms, we are developing a new platform for public participation that we expect will reduce the time to a treatment from decades to only a few years.</p>
<p>If you are interested in participating in an online activity that will directly contribute to Alzheimer&rsquo;s research, please pre-register <a href="http://wecurealz.com/">here</a>. By participating, you will not only help speed up a treatment, but also understand more about the disease and exactly how your efforts make a difference.</p>
<p>Pietro Michelucci</p>`;

  const posts = [
    {
      slug: "stall-catchers-citizen-scientists",
      title:
        "Stall Catchers – citizen scientists worldwide are speeding up Alzheimer's research",
      excerpt:
        "Stall Catchers crowdsources analysis of blood vessel stalls in mouse brains to accelerate Alzheimer’s research at Cornell.",
      body: stallCatchersBody,
      publishedAt: new Date("2017-11-29T12:00:00.000Z"),
    },
    {
      slug: "crowd2map-tanzania",
      title: "Crowd2Map Tanzania",
      excerpt:
        "Mapping rural Tanzania in OpenStreetMap to fight FGM and foster development—co-created with the Tanzania Development Trust.",
      body: crowd2mapBody,
      publishedAt: new Date("2017-03-30T12:00:00.000Z"),
    },
    {
      slug: "eyesonalz-pbs",
      title: "EyesOnALZ on PBS",
      excerpt:
        "EyesOnALZ and Stall Catchers featured in Episode 1 of The Crowd and The Cloud on public television.",
      body: eyesPbsBody,
      publishedAt: new Date("2017-03-29T12:00:00.000Z"),
    },
    {
      slug: "crowdsourcing-alzheimers",
      title: "Crowdsourcing Alzheimer's Research",
      excerpt:
        "HCI is building a citizen science platform so the public can contribute directly to Alzheimer’s research.",
      body: crowdsourcingBody,
      publishedAt: new Date("2015-05-13T12:00:00.000Z"),
    },
  ] as const;

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        body: post.body,
        excerpt: post.excerpt,
        status: "published",
        publishedAt: post.publishedAt,
        authorId: admin.id,
      },
      create: {
        slug: post.slug,
        title: post.title,
        body: post.body,
        excerpt: post.excerpt,
        status: "published",
        publishedAt: post.publishedAt,
        authorId: admin.id,
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
