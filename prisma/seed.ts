import "dotenv/config";
import { PrismaClient } from "@prisma/client";
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
    imageUrl?: string | null;
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
        imageUrl: data.imageUrl ?? null,
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
      imageUrl: data.imageUrl ?? null,
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
      role: "ADMIN",
    },
    create: {
      email: "admin@humancomputation.org",
      name: "HCI Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Core Team
  await upsertPerson("Ravish Dussaruth", "core", {
    title: "Lead Software Developer, Human Computation Institute",
    sortOrder: 0,
  });
  await upsertPerson("Pietro Michelucci", "core", {
    title: "Executive Director",
    photoUrl: "/images/people/pietro-michelucci.jpg",
    sortOrder: 1,
  });
  await upsertPerson("Egle Marija Ramanauskaite", "core", {
    title: "Citizen Science Coordinator",
    photoUrl: "/images/people/egle-ramanauskaite.png",
    sortOrder: 2,
  });
  await upsertPerson("Elizabeth Tyson", "core", {
    title: "Strategic Advisor",
    photoUrl: "/images/people/elizabeth-tyson.jpg",
    sortOrder: 3,
  });
  await upsertPerson("Libuse Hannah Veprek", "core", {
    photoUrl: "/images/people/libuse-veprek.png",
    sortOrder: 4,
  });

  // Board of Directors
  await upsertPerson("Darlene Cavalier", "board", {
    title: "Founding Director, SciStarter\nProfessor of Practice, Arizona State University",
    photoUrl: "/images/people/darlene-cavalier.jpg",
    sortOrder: 0,
  });
  await upsertPerson("Janis Dickinson", "board", {
    title: "Professor, Natural Resources, Cornell University\nArthur A. Allen Director of Citizen Science, Cornell Lab of Ornithology",
    photoUrl: "/images/people/janis-dickinson.png",
    sortOrder: 1,
  });
  await upsertPerson("Pietro Michelucci", "board", {
    title: "Executive Director",
    photoUrl: "/images/people/pietro-michelucci.jpg",
    sortOrder: 2,
  });

  // External Faculty
  await upsertPerson("Oliver Bracko", "faculty", {
    title: "Alzheimer's researcher, Cornell University",
    photoUrl: "/images/people/oliver-bracko.jpg",
    sortOrder: 0,
  });
  await upsertPerson("Andrea Wiggins", "faculty", {
    title: "Assistant Professor, University of Maryland, College of Information Studies",
    photoUrl: "/images/people/andrea-wiggins.png",
    sortOrder: 1,
  });
  await upsertPerson("Margaret Wallace", "faculty", {
    title: "Chief Executive Officer, Playmatics, Brooklyn, NY, USA",
    photoUrl: "/images/people/margaret-wallace.jpg",
    sortOrder: 2,
  });
  await upsertPerson("Jerome Waldispuhl", "faculty", {
    title: "Associate Professor, School of Computer Science, McGill University, Canada",
    photoUrl: "/images/people/jerome-waldispuhl.png",
    sortOrder: 3,
  });
  await upsertPerson("Attila Szantner", "faculty", {
    title: "CEO, Massively Multiplayer Online Science",
    photoUrl: "/images/people/attila-szantner.png",
    sortOrder: 4,
  });
  await upsertPerson("Pablo Suarez", "faculty", {
    title: "Associate Director for Research and Innovation, Red Cross Red Crescent Climate Centre",
    photoUrl: "/images/people/pablo-suarez.png",
    sortOrder: 5,
  });
  await upsertPerson("Melanie Stegman", "faculty", {
    title: "Owner, Biochemist, Game Designer, Molecular Jig Games",
    photoUrl: "/images/people/melanie-stegman.png",
    sortOrder: 6,
  });
  await upsertPerson("Paul Smaldino", "faculty", {
    title: "Postdoctoral Scholar, Departments of Anthropology, Political Science, and Computer Science, University of California, Davis",
    photoUrl: "/images/people/paul-smaldino.jpg",
    sortOrder: 7,
  });
  await upsertPerson("Chris B. Schaffer", "faculty", {
    title: "Associate Professor, Cornell University, Department of Biomedical Engineering",
    photoUrl: "/images/people/chris-schaffer.jpg",
    sortOrder: 8,
  });
  await upsertPerson("Egle M. Ramanauskaite", "faculty", {
    title: "Citizen Science Coordinator, Human Computation Institute",
    photoUrl: "/images/people/egle-ramanauskaite.png",
    sortOrder: 9,
  });
  await upsertPerson("Matjaz Perc", "faculty", {
    title: "Professor of Physics, University of Maribor, Slovenia",
    photoUrl: "/images/people/matjaz-perc.png",
    sortOrder: 10,
  });
  await upsertPerson("Darlene Cavalier", "faculty", {
    title: "Founding Director, SciStarter, Professor of Practice, Arizona State University",
    photoUrl: "/images/people/darlene-cavalier.jpg",
    sortOrder: 11,
  });

  // Projects
  const projects = [
    {
      slug: "crowdmeter",
      name: "CrowdMeter",
      description: "App and research effort exploring how shared crowd signals can help people make informed choices about crowded places and public health.",
      imageUrl: "/images/projects/crowdmeter.png",
      link: "https://humancomputation.org/projects/crowdmeter/",
      sortOrder: 0,
    },
    {
      slug: "civium",
      name: "Civium",
      description: "Integration platform concept for sustainable human computation - connecting stakeholders, tasks, and outcomes across participatory systems.",
      imageUrl: "/images/projects/civium.png",
      link: "https://humancomputation.org/civium/",
      sortOrder: 1,
    },
    {
      slug: "dream-catchers",
      name: "Dream Catchers",
      description: "Online game using crowdsourcing to advance Sudden Infant Death Syndrome (SIDS) research while spreading awareness of safe sleep guidelines.",
      imageUrl: "/images/projects/dream-catchers.png",
      link: "https://dreamcatchers.app",
      sortOrder: 2,
    },
    {
      slug: "stall-catchers",
      name: "Stall Catchers",
      description: "Citizen science game that crowdsources analysis of blood vessel movies to accelerate Alzheimer's research with Cornell's Schaffer-Nishimura Lab.",
      imageUrl: "/images/projects/stall-catchers.png",
      link: "https://stallcatchers.com",
      sortOrder: 3,
    },
    {
      slug: "eyesonalz",
      name: "EyesOnALZ",
      description: "Platform and partnership initiative turning complex laboratory analysis into engaging games so the public can contribute to Alzheimer's research.",
      imageUrl: "/images/projects/eyesonalz.png",
      link: "http://eyesonalz.com",
      sortOrder: 4,
    },
    {
      slug: "crowd2map",
      name: "Crowd2Map Tanzania",
      description: "Crowdsourced mapping initiative to improve OpenStreetMap coverage in rural Tanzania, supporting development and community safety efforts.",
      imageUrl: "/images/projects/crowd2map.png",
      link: "https://crowd2map.wordpress.com",
      sortOrder: 5,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        imageUrl: (p as { imageUrl?: string }).imageUrl ?? null,
        link: (p as { link?: string }).link ?? null,
        sortOrder: p.sortOrder,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        imageUrl: (p as { imageUrl?: string }).imageUrl ?? null,
        link: (p as { link?: string }).link ?? null,
        sortOrder: p.sortOrder,
      },
    });
  }

  // Partners (all 9 from original site)
  await upsertPartner("Aspen Tech Policy Hub", {
    logoUrl: "/images/partners/aspen-tech.png",
    sortOrder: 0,
  });
  await upsertPartner("DrivenData", {
    logoUrl: "/images/partners/drivendata.png",
    link: "https://www.drivendata.org",
    sortOrder: 1,
  });
  await upsertPartner("Cornell University", {
    logoUrl: "/images/partners/cornell.png",
    link: "https://www.cornell.edu",
    sortOrder: 2,
  });
  await upsertPartner("Microsoft Research", {
    logoUrl: "/images/partners/microsoft-research.jpg",
    link: "https://www.microsoft.com/en-us/research/",
    sortOrder: 3,
  });
  await upsertPartner("Microsoft", {
    logoUrl: "/images/partners/microsoft.png",
    link: "https://www.microsoft.com",
    sortOrder: 4,
  });
  await upsertPartner("National Science Academy", {
    logoUrl: "/images/partners/nsa.png",
    sortOrder: 5,
  });
  await upsertPartner("SciStarter", {
    logoUrl: "/images/partners/scistarter.jpg",
    link: "https://scistarter.org",
    sortOrder: 6,
  });
  await upsertPartner("BrightFocus Foundation", {
    logoUrl: "/images/partners/brightfocus.png",
    link: "https://www.brightfocus.org",
    sortOrder: 7,
  });
  await upsertPartner("Doug Engelbart Institute", {
    logoUrl: "/images/partners/doug-engelbart.jpg",
    link: "https://www.dougengelbart.org",
    sortOrder: 8,
  });

  // Publications
  await prisma.publication.deleteMany({});

  await upsertPublication("Handbook of Collective Intelligence", {
    category: "book",
    link: "https://mitpress.mit.edu/handbook",
    imageUrl: "/images/publications/ci-handbook.png",
    description: "This 2015 handbook, co-edited by HCI External Professor Michael S. Bernstein, collects essays on Collective Intelligence by leading researchers across related disciplines. Generally speaking, collective intelligence is groups of individuals acting collectively in ways that seem intelligent. In recent years, a new kind of collective intelligence has emerged: interconnected groups of people and computers, collectively doing intelligent things. Today these groups are engaged in tasks that range from writing software to predicting the results of presidential elections. This volume reports on the latest research in the study of collective intelligence, laying out a shared set of research challenges from a variety of disciplinary and methodological perspectives.",
    sortOrder: 0,
  });
  await upsertPublication("Springer Handbook of Human Computation", {
    category: "book",
    link: "http://www.springer.com/computer/ai/book/978-1-4614-8805-7",
    imageUrl: "/images/publications/hc-handbook.png",
    description: "This 2013 volume, edited by our founder, addresses the emerging area of human computation. The chapters, written by leading international researchers including HC Institute faculty, explore existing and future opportunities to combine the respective strengths of both humans and machines in order to create powerful problem-solving capabilities. The book bridges scientific communities, capturing and integrating the unique perspective and achievements of each. It coalesces contributions from experts in diverse areas, including a foreword by celebrated cultural anthropologist Mary Catherine Bateson, to reveal that human computation encompasses disciplines from crisis management to digital curation to scientific and market research. The book combines industry perspectives with related disciplines in order to motivate, define, and anticipate the future of this exciting new frontier in science and cultural evolution.\n\nThe comprehensive, current, and interdisciplinary treatment transcends the technical scope of previous studies on the topic. Readers will discover valuable contributions covering Foundations; Application Domains; Techniques and Modalities; Infrastructure and Architecture; Algorithms; Participation; Analysis; Policy and Security and the Impact of Human Computation.",
    sortOrder: 1,
  });
  await upsertPublication("Citizen Science: Public Participation in Environmental Research", {
    category: "book",
    link: "http://www.amazon.com/Citizen-Science-Participation-Environmental-Research-ebook/dp/B007NK5I16/",
    imageUrl: "/images/publications/citizen-science.jpg",
    description: "This book, edited by HC Institute External Professor Janis L. Dickinson, describes an approach to citizen science that enlists members of the public to make and record useful observations, such as counting birds in their backyards, watching for the first budding leaf in spring, or measuring local snowfall. The large numbers of volunteers who participate in projects such as Project FeederWatch or Project BudBurst collect valuable research data, which, when pooled together, create an enormous body of scientific data on a vast geographic scale. In return, such projects aim to increase participants' connections to science, place, and nature, while supporting science literacy and environmental stewardship. In Citizen Science, experts from a variety of disciplines -- including scientists and education specialists working at the Cornell Lab of Ornithology, where many large citizen science programs use birds as proxies for biodiversity -- share their experiences of creating and implementing successful citizen science projects, primarily those that use massive data sets gathered by citizen scientists to better understand the impact of environmental change.",
    sortOrder: 2,
  });

  await upsertPublication("Human Computation - a transdisciplinary journal", {
    category: "journal",
    link: "http://hcjournal.org",
    imageUrl: "/images/publications/hc-journal.png",
    description: "The transdisciplinary journal, Human Computation, is published by the Human Computation Institute. It is an international forum for high-quality scholarly articles in all areas of human computation, which concerns the design or analysis of information processing systems in which humans participate as computational elements.\n\nTechnology.org published an October 2014 article about the first issue.",
    sortOrder: 0,
  });

  const articles = [
    { title: 'P. Michelucci and J. L. Dickinson, "The power of crowds," Science, vol. 351, no. 6268, pp. 32-33, Jan. 2016.', link: "https://www.researchgate.net/publication/288903608_The_power_of_crowds_Combining_humans_and_machines_can_help_tackle_increasingly_hard_problems", year: "2016" },
    { title: 'P. Michelucci, "Human Computation and Convergence," in Handbook of Science and Technology Convergence, W. S. Bainbridge and M. C. Roco, Eds. Springer International Publishing, 2016.', link: "http://arxiv.org/abs/1503.05959", year: "2016" },
    { title: 'S. Belongie and P. Perona, "Visipedia circa 2015," Pattern Recognition Letters.', link: "http://www.sciencedirect.com/science/article/pii/S0167865515004092", year: "2015" },
    { title: 'J. P. Bigham, J. O. Wobbrock, and W. S. Lasecki, "Target Acquisition and the Crowd Actor," Human Computation, vol. 2, no. 2, Dec. 2015.', link: "http://hcjournal.org/ojs/index.php?journal=jhc&page=article&op=view&path%5B%5D=58&path%5B%5D=55", year: "2015" },
    { title: 'A. Bowser and A. Wiggins, "Privacy in Participatory Research: Advancing Policy to support Human Computation," Human Computation, vol. 2, no. 1, pp. 19-44, 2015.', link: "http://hcjournal.org/ojs/index.php?journal=jhc&page=article&op=view&path%5B%5D=44&path%5B%5D=48", year: "2015" },
    { title: 'T. Hogg and K. Lerman, "Disentangling the Effects of Social Signals," Human Computation, vol. 2, no. 2, Dec. 2015.', link: "http://hcjournal.org/ojs/index.php?journal=jhc&page=article&op=view&path%5B%5D=59&path%5B%5D=59", year: "2015" },
    { title: 'P. Michelucci, L. Shanley, J. Dickinson, H. Hirsh, and Workshop Participants, "A U.S. Research Roadmap for Human Computation," Computing Community Consortium Technical Report, 2015.', link: "https://www.researchgate.net/profile/Lea_Shanley/publication/277019488_A_U.S._Research_Roadmap_for_Human_Computation/", year: "2015" },
    { title: 'P. Suarez, "Rethinking Engagement: Innovations in How Humanitarians Explore Geoinformation," ISPRS International Journal of Geo-Information, vol. 4, no. 3, pp. 1729-1749, Sep. 2015.', link: "http://www.mdpi.com/2220-9964/4/3/1729/pdf", year: "2015" },
    { title: 'R. J. Crouser, B. Hescott, and R. Chang, "Toward Complexity Measures for Systems Involving Human Computation," Human Computation, vol. 1, no. 1, Sep. 2014.', link: "http://hcjournal.org/ojs/index.php?journal=jhc&page=article&op=view&path%5B%5D=25&path%5B%5D=6", year: "2014" },
    { title: 'W. S. Lasecki, C. Homan, and J. P. Bigham, "Architecting Real-Time Crowd-Powered Systems," Human Computation, vol. 1, no. 1, Sep. 2014.', link: "http://hcjournal.org/ojs/index.php?journal=jhc&page=article&op=view&path%5B%5D=29&path%5B%5D=7", year: "2014" },
    { title: 'A. Wiggins and K. Crowston, "Surveying the citizen science landscape," First Monday, vol. 20, no. 1, Dec. 2014.', link: "http://journals.uic.edu/ojs/index.php/fm/article/view/5520/4194", year: "2014" },
    { title: 'M. Blumberg and P. Michelucci, "The Psychopathology of Information Processing Systems," in Handbook of Human Computation, P. Michelucci, Ed. Springer New York, 2013, pp. 51-59.', link: "https://www.researchgate.net/publication/273317643_The_Psychopathology_of_Information_Processing_Systems", year: "2013" },
    { title: 'J. L. Dickinson, R. L. Crain, H. K. Reeve, and J. P. Schuldt, "Can evolutionary design of social networks make it easier to be green?," Trends Ecol. Evol., vol. 28, no. 9, pp. 561-569, Sep. 2013.', link: "https://www.researchgate.net/publication/240308541_Can_evolutionary_design_of_social_networks_make_it_easier_to_be_%27green%27", year: "2013" },
    { title: 'A. Kittur, J. V. Nickerson, M. Bernstein, E. Gerber, A. Shaw, J. Zimmerman, M. Lease, and J. Horton, "The Future of Crowd Work," in Proceedings of the 2013 Conference on Computer Supported Cooperative Work, 2013, pp. 1301-1318.', link: "https://www.lri.fr/~mbl/ENS/CSCW/2012/papers/Kittur-CSCW13.pdf", year: "2013" },
    { title: 'P. Michelucci, "Introduction," in Handbook of Human Computation, P. Michelucci, Ed. Springer New York, 2013, pp. 83-86.', link: "https://humancomputation.org/wphci/wp-content/uploads/2014/10/book_intro_pre.pdf", year: "2013" },
    { title: 'P. Michelucci, "Synthesis and Taxonomy of Human Computation," in Handbook of Human Computation, P. Michelucci, Ed. Springer New York, 2013, pp. 83-86.', link: "https://humancomputation.org/wphci/wp-content/uploads/2014/10/michelucci-synthesis-pre.pdf", year: "2013" },
    { title: 'P. Michelucci, "Human Computation: A Manifesto," in Handbook of Human Computation, P. Michelucci, Ed. Springer New York, 2013, pp. 1021-1038.', link: "https://humancomputation.org/wphci/wp-content/uploads/2014/10/michelucci-manifesto-pre.pdf", year: "2013" },
    { title: 'R. J. Crouser and R. Chang, "An Affordance-Based Framework for Human Computation and Human-Computer Collaboration," IEEE Transactions on Visualization and Computer Graphics, vol. 18, no. 12, pp. 2859-2868, 2012.', link: "http://www.cs.tufts.edu/~remco/publications/2012/VAST2012-HumanComplexity.pdf", year: "2012" },
    { title: 'D. C. Engelbart and C. Engelbart, "Bootstrapping and the handbook cycle," Telematics and Informatics, vol. 7, no. 1, pp. 27-32, Jan. 1990.', link: "http://www.sciencedirect.com/science/article/pii/073658539090012H", year: "Early" },
  ];
  for (let i = 0; i < articles.length; i++) {
    await prisma.publication.create({
      data: {
        title: articles[i].title,
        link: articles[i].link,
        description: articles[i].year,
        category: "article",
        sortOrder: i,
      },
    });
  }

  // Videos (from HCI YouTube playlist PLOXMOfnh9jPkVncp_13Jg8AEGjDAbXHnd)
  await prisma.video.deleteMany({});
  const videos = [
    { title: "The Conundrum of Purpose in Collective Intelligence Systems", id: "SdDXVeif9c0" },
    { title: "Michael Bernstein: Crowd-powered systems", id: "teOBdtZR5uQ" },
    { title: "Internet Hall of Fame 2014: Christina Engelbart", id: "SJkoD_d5Y1s" },
    { title: "Chris Schaffer Science Talk", id: "6jBMFNyEBk8" },
    { title: "Real-Time Crowd Support for People with Disabilities - Jeffrey Bigham", id: "oUebwz1QqOo" },
    { title: "2013 Conference Keynote Speaker - Darlene Cavalier", id: "wPHZiP-g1yU" },
    { title: "Overview of Citizen Science Methodologies - Pietro Michelucci", id: "ZAvtCeBTDeU" },
    { title: "Pablo Suarez speaking at CBA6 on participatory game playing in Guatemala", id: "KPBcVuIALqU" },
    { title: "Andrea Wiggins - With Great Data Comes Great Responsibility", id: "LdE6_vAQmB0" },
    { title: "Archive: Crowd-Agents: Creating Crowd-Powered Interactive Systems", id: "fUKNe3sDf6Q" },
    { title: "Stanford Seminar - Work as Coordination and Coordination as Work", id: "fNmY4Xv-HHw" },
    { title: "Colloquium: Lucy Fortson, November 5, 2015", id: "dIaYvoeiug4" },
    { title: "Archive: Incentives in Online Contribution: A Game-Theoretic Framework", id: "jTkWjx9ngEQ" },
    { title: "Niki Kittur", id: "PN3drwxHw2Y" },
    { title: "Cognition in Ants, Robots, and Pre-biotic Chemistries", id: "4FKVpdGOD2c" },
    { title: "Talk by Pietro Michelucci at the CSA conference 2017 (unedited)", id: "r7FgtIPA5dY" },
    { title: "Dynamic Consensus Methods of Stall Catchers (talk at CitSci2017 conference)", id: "8IdojGgzBk4" },
    { title: "Pietro Michelucci: Life, the Universe, and Information Processing", id: "G1IKkbC4M-c" },
    { title: "Lecture: the role of reduced blood flow in Alzheimer's & the Stall Catchers game", id: "MLvlvd3gldY" },
    { title: "A Human/Machine Partnership to Accelerate Biomedical Research", id: "-jurKOasp-Y" },
    { title: "Alzheimer's Research Q&A with Tredyffrin Township Libraries - Paoli Library", id: "qJgR6muLzrQ" },
    { title: "Keynote interview of Pietro Michelucci at the ECSA 2020 conference", id: "egqgCKBaIbs" },
    { title: "CrowdMeter simulation results out-brief", id: "TLd7D48KCb4" },
    { title: "The Fence Story", id: "YGf3vxDSXcs" },
  ];
  for (let i = 0; i < videos.length; i++) {
    await prisma.video.create({
      data: {
        title: videos[i].title,
        youtubeUrl: `https://www.youtube.com/embed/${videos[i].id}`,
        sortOrder: i,
      },
    });
  }

  // Site Settings
  const siteSettings: { key: string; value: string }[] = [
    { key: "contact_address", value: "Ithaca, NY" },
    { key: "contact_phone", value: "+1(607)319-3119" },
    { key: "contact_email", value: "info@humancomputation.org" },
    { key: "social_twitter", value: "https://twitter.com/hcinst" },
    { key: "social_facebook", value: "https://www.facebook.com/humancomputationinstitute" },
    { key: "social_youtube", value: "https://www.youtube.com/channel/UCoc_fLZ6NRqyJGeAVkev8Jg" },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
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
