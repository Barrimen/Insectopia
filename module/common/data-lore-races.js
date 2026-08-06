/**
 * data-lore-races.js
 * Source : Insectopia - Livre de base v2.pdf, section "Les Peuples" (p.16-73)
 * Clés alignées sur module/common/data-races.js (mécanique).
 * Consommé par tools/build-races-journal.mjs pour enrichir les pages du
 * JournalEntry "Insectopia — Races" avec le lore narratif, en complément
 * des données mécaniques déjà générées depuis data-races.js.
 *
 * État d'avancement : 5/20 races (apis, blatere, brindis, cerk, crinar).
 * Champs incomplets signalés par "// À COMPLÉTER" dans le texte lui-même.
 */

export const LORE_RACES = {

  apis: {
    nomAffiche: "Apis",
    phrase: "Avoir connaissance de la foi, c'est avoir foi en la connaissance.",
    apparence:
      "Créatures de taille réduite (deux insètres de haut maximum), agiles et rapides. " +
      "Ressemblent aux Vespales par leur forme générale, mais arborent un pelage marron. " +
      "Ailes puissantes, carapace poilue, crâne volumineux à grands yeux à facettes et petites " +
      "antennes. Un dard venimeux pointe à l'extrémité de l'abdomen — contrairement à leurs " +
      "ancêtres, les Apis l'utilisent désormais sans risquer leur propre vie. Corpulence frêle : " +
      "de piètres guerrières, mais capables de faire face à l'adversité avec courage.",
    societe: {
      titre: "Raffinement, puissance économique et ouverture culturelle",
      texte:
        "Peuple raffiné et ouvert, moteur de nombreuses innovations, à commencer par " +
        "l'architecture : le style vespalo-apisien, fondé sur la figure de l'hexagone, a donné " +
        "naissance aux cités ruches — bâties dans les plus grands arbres, abritant jusqu'à " +
        "plusieurs millions d'individus. Six cités ruches existent : Anthidié (Austeria), Haclite " +
        "et Cartalle (Luxuria), Gelia, Cerane et Mellifera (Orterron, seule cité ruche bâtie sur " +
        "un Arbre-vie). Les Apis cultivent aussi un savoir immense : leurs bibliothèques, dédales " +
        "d'histoire et de sagesse, sont protégées par une armada de penseurs. Peuple cultiste allié " +
        "des Myrmides de l'Empire des Sarabandes, les Apis pratiquent leur foi avec ferveur mais " +
        "sans fanatisme, et se distinguent par leur ouverture aux autres cultures et religions — " +
        "une position que leur richesse économique leur permet d'assumer. Cette richesse vient de " +
        "la mielline, substance alchimique aux vertus curatives dont elles sont les seules " +
        "productrices. Elles entretiennent également un lien unique avec les plantes via la " +
        "récolte du pollen, activité qui leur vaut le respect des autres peuples. La plupart des " +
        "Apis sont nourricières, marchandes ou artisanes ; elles fournissent aussi des prêtres des " +
        "Anciens Dieux réputés. Malgré leur faible stature, les Apis mielliques ont formé des " +
        "troupes armées surprenantes par leur nombre, leur organisation et leur technique."
    },
    organisationSociale:
      "Société très structurée (à l'image des Termides ou des Myrmides), bâtie autour d'une " +
      "reine par cité, elle-même sous l'autorité de l'impératrice pluri-cyclique qui règne seule " +
      "et détient droit de vie et de mort sur tout le Royaume miellique. Chaque cité ruche/essaim " +
      "obéit à une reine — unique reproductrice, témoin-relais de l'impératrice — qui répartit " +
      "ses filles en quatre castes : les prêtresses (savoir, recettes de mielline), les " +
      "magasinières (nobles marchandes, gestion des stocks et de la couveuse), les butineuses " +
      "(ouvrières, récolte du pollen/nectar, élaboration de la mielline) et les gardiennes " +
      "(protection à tous les niveaux, la garde rapprochée de la reine étant un honneur suprême). " +
      "La majorité des Apis sont des femelles dépourvues d'organes reproducteurs, qui dirigent la " +
      "société ; le rôle des mâles se limite généralement à la fécondation des reines, bien que " +
      "certains, aux capacités prometteuses, embrassent une carrière de troubadour ou de bretteur " +
      "(rare). Contrairement aux Termides ou Myrmides, les ouvrières apis ne sont pas contrôlées " +
      "par les phéromones des dominants : elles conservent volonté propre et libre arbitre.",
    artEtLangage:
      "Forte tradition orale et phéromonale, doublée d'un langage écrit ancien et complexe. Le " +
      "mode de communication principal, l'apisilia, mêle phéromones, parole et danses expressives " +
      "en adéquation avec les sentiments exprimés — reprise lors des fêtes de l'Empire, dans les " +
      "bars mielliques, et lors de la Memoria où des centaines de danseuses se produisent dans les " +
      "allées de Mellifera. Cette danse devient aussi un art martial chorégraphié lors des joutes " +
      "en l'honneur de l'impératrice. Les Apis sont également musiciennes : le bourdonnement de " +
      "leurs ailes produit une litanie harmonieuse, enrichie d'instruments comme les bordes " +
      "(cornes de métal effilées au son aigu). Vestimentairement, dévotion aux Anciens Dieux " +
      "oblige, elles portent des robes en soie apiloé ornées de dentelle fine (la dentelle de " +
      "Cerane est réputée dans la noblesse cultiste ; un défilé de mode a lieu deux fois par cycle " +
      "à Cartalle). Cuir et métal d'armures myrmides protègent les guerrières ; les prêtresses " +
      "arborent l'emblème cultiste sur un surcot de soie blanche (or pour les archiprêtresses).",
    religion: {
      culte: "Cultiste (culte des Anciens Dieux)",
      details:
        "Les Apis ont embrassé le culte dès ses origines, désignées « gardiennes de la Foi » par " +
        "l'impératrice Sarail III — une dévotion naturelle compte tenu de leur loyauté sans limite " +
        "envers leur reine, à l'image de la conversion de leur souveraine Shirna Ashna IV. Le culte " +
        "est religion unique en Apidalum, mais sans pouvoir politique propre : l'impératrice ne " +
        "reçoit d'ordres de personne et dicte elle-même les directives à l'Ordre. Elle forme la " +
        "Grande cardinale et chaque archiprêtresse désignée par les trois tours du Séminaire de la " +
        "Foi. Les archiprêtresses garantissent la Foi dans les cités et supervisent la recherche " +
        "de la mielline, dont les recettes descendent aux prêtresses puis aux ouvrières. Dans les " +
        "régions animistes, certaines cités ruches sont entièrement dévouées aux Dieux de la " +
        "nature — considérées comme dissidentes par leurs sœurs de l'Empire miellique."
    },
    prejuges:
      "Peuple globalement apprécié : la pollinisation leur vaut le respect général, et leur " +
      "ouverture/tolérance envers animistes comme cultistes est reconnue, quoique parfois jugée " +
      "trop conciliante par certains peuples. Relations tendues avec les Vespales (non amicales), " +
      "méfiance et dédain envers les Syrphes (perçus comme voleurs) et les Sticks (perçus comme " +
      "escrocs/contrefacteurs de mielline). Accusées par d'autres peuples d'être imbues d'elles-" +
      "mêmes du fait de leur maîtrise de la mielline. Rapport ambigu avec les Putères sur le " +
      "commerce (jugé vérolé par pratiques amorales, sans empêcher les profits mutuels liés à la " +
      "mielline). Les Blatères, en particulier, ne supportent pas l'indécision, la mollesse et la " +
      "candeur des Apis envers le camp adverse.",
    population:
      "Plus d'une dizaine de millions d'individus, issus d'une même ethnie, répartis " +
      "principalement dans Apidalum (Empire miellique) ainsi que dans des cités essaims au sein " +
      "de l'Empire des Sarabandes et des royaumes du Sud. Hors Apidalum, les villes apis restent " +
      "modestes — seules les cités impériales détiennent les secrets de la mielline — mais " +
      "ouvertes aux autres races venues commercer ou consulter les arbres de connaissance. " +
      "L'Empire miellique comprend deux régions : Luxuria et Orterron. Au nord, dans l'Empire des " +
      "Sarabandes, la région d'Austeria (Terres Austères) a pour capitale Anthidié, cité des " +
      "Apidions — des Apis plus robustes, adaptées au froid septentrional. De nombreuses cités " +
      "essaims sont dispersées sur le continent, généralement bien accueillies pour leur rôle de " +
      "pollinisation et le surplus de nourriture (pollen, miel) qu'elles apportent aux peuples " +
      "locaux. Les Apis des terres du Sud sont le plus souvent animistes, vénèrent Onono et " +
      "vivent en harmonie avec les croyances locales ; leur langage y est essentiellement " +
      "phéromonal et gestuel plutôt qu'oral.",
    onomastique:
      "Sonorités dominantes en « ok », « ost », « ib », composées avec des syllabes « tra », " +
      "« chir », « trish », « ash ». Noms généralement composés de trois syllabes. " +
      "Exemples : Trishta, Ashkonda.",
    image: ""
  },

  blatere: {
    nomAffiche: "Blatère",
    phrase: "Seuls ceux qui portent du métal et qui vénèrent les Anciens Dieux peuvent prétendre être des intres.",
    apparence:
      "Taille variant de trois à cinq insètres. Corps allongé et aplati, de forme ovale. Tête " +
      "minuscule cachée sous un thorax en véritable armure — carapace solide composée de plaques " +
      "superposées, recouverte d'une substance huileuse et visqueuse, de couleur sombre (noir à " +
      "bleu très foncé). Considérées à juste titre comme laides et repoussantes. Antennes " +
      "filiformes offrant une perception phéromonale de qualité. Appareil buccal broyeur à deux " +
      "paires de mandibules puissantes, régime alimentaire très varié. Cerques à l'extrémité du " +
      "thorax pour communiquer et détecter toute présence vivante. Paire d'ailes réduite par " +
      "rapport à leur masse : de piètres acrobates en vol.",
    societe: {
      titre: "La force du culte et de l'armée",
      texte:
        "L'essentiel du peuple blatère habite le Royaume de Justice, vaste territoire marécageux " +
        "chaud et humide auquel la race s'est parfaitement adaptée. Cités bâties sur des " +
        "promontoires de faible altitude, majoritairement souterraines (galeries et salles), la " +
        "partie visible se limitant à des bâtiments de pierre rudimentaires, tours de défense, " +
        "baraquements militaires et enceinte de bois. Peuple de nature belliqueuse et passionnée, " +
        "vivant essentiellement pour sa nation et sa religion. Le Royaume de Justice, théocratie " +
        "militaire, poursuit un objectif : faire triompher le culte des Anciens Dieux et éradiquer " +
        "par la force les menaces animistes. Organisation militaire pluricyclaire enrôlant une " +
        "large part de la population. Les Blatères ne sont pas de grands maîtres d'armes, mais " +
        "leur stature, leur carapace et leur rapidité en font des combattantes redoutables, " +
        "renforcées par un usage massif d'armes et d'armures de métal."
    },
    organisationSociale:
      "L'une des organisations sociales les plus hiérarchisées d'Entoma : théocratie militaire " +
      "sous l'autorité d'une reine, intermédiaire entre son peuple et les Anciens Dieux (elle " +
      "n'enfante pas toute la colonie, contrairement à une reine apis). Structure pyramidale à " +
      "plusieurs dizaines de niveaux hiérarchiques, chaque strate devant obéissance totale aux " +
      "strates supérieures ; trahison et désobéissance punies de mort. Plaisirs rares et " +
      "contrôlés ; sexualité encadrée par les prêtres du culte ; reproduction réservée aux " +
      "femelles pondeuses archétypales, fécondées par les mâles les plus grands. Larves issues " +
      "d'une oothèque ancestrale, éduquées par prêtres et militaires selon leurs prédispositions, " +
      "puis intégrées à la société à une place choisie par la hiérarchie une fois devenues imagos.",
    artEtLangage:
      "Parlent le entia, langue commune à tous les intres d'Entoma (pratiquée à l'origine par les " +
      "Putères) ; les prêtres blatères maîtrisent aussi, très partiellement, le langage des " +
      "Anciens Dieux. Peuple peu porté sur les arts : musique, danse et spectacle n'intéressent " +
      "guère, au profit des joutes et combats — le duel est une institution, parfois jusqu'à la " +
      "mort, dans les coursives des cités ou en arènes dédiées. Le gouvernement organise " +
      "fréquemment des joutes publiques pour démontrer grandeur, puissance et vitesse des corps " +
      "blatères. Pas d'artisanat notable : la principale richesse du peuple est son armée de " +
      "métier, pétrie d'un sens rare de l'obéissance — défense et sécurité sont les seuls " +
      "services monnayables de ce peuple.",
    religion: {
      culte: "Cultiste (culte des Anciens Dieux)",
      details:
        "Longtemps représentantes exclusives de la vertuaire de la Justice au sein de l'Église, " +
        "les Blatères y restent aujourd'hui largement majoritaires. Dogme appliqué à la lettre, " +
        "avec zèle et intransigeance ; rejet des autres croyances d'Entoma — pour elles, seule " +
        "leur voie (et éventuellement quelques cultistes éclairés) détient la vérité."
    },
    prejuges:
      "Peuple peu aimé, probablement en raison de son régime alimentaire varié et de ses " +
      "positions religieuses extrêmement tranchées — la haine qu'elles vouent aux autres peuples " +
      "explique en grande partie cette aversion réciproque. Haine particulière envers les " +
      "Vespales et les Crinars (voisins directs). Seules trouvent grâce à leurs yeux les " +
      "Myrmides, les Lépides, les Skarabs et les Brindis. Réputées intransigeantes, violentes et " +
      "disciplinées ; les Myrmides, qui traitent souvent avec elles, leur reconnaissent fiabilité, " +
      "franchise, et une puissance militaire dévouée au culte qui en fait une valeur sûre.",
    population:
      "Environ une dizaine de millions d'individus, concentrés dans le Royaume de Justice, " +
      "territoire à l'unité très ancienne structuré autour de sa capitale Supella. Climat chaud " +
      "et humide, territoire essentiellement marécageux à végétation peu prolifique — un cadre " +
      "inhospitalier que seules les Blatères, au régime alimentaire très varié, ont su coloniser. " +
      "Grandes cités majoritairement souterraines : Manoth (cité militaire), Ombra (ville secrète " +
      "des montagnes d'Arron), Garanodra (cité minière), Ténébra la sinistre, et les cités " +
      "jumelles d'Alan'Bar et d'Alan'Voreth (gardiennes des terres sauvages du Levant). Aux " +
      "origines plusieurs ethnies coexistaient ; le pouvoir central les a éradiquées ou laissé " +
      "s'éteindre, ne conservant que l'ethnie blattaria (celle de la reine). Les Blatères ayant " +
      "quitté religion et territoire pour servir des terres libres ou animistes sont nommées " +
      "Fanges par leurs congénères — traîtres à la cause, leur tête est mise à prix.",
    onomastique:
      "Langage aux sons graves et au rythme saccadé, donnant des noms puissants et résonnants. " +
      "Exemples : Akno Jegar, Odon 'N' Gar.",
    image: ""
  },

  brindis: {
    nomAffiche: "Brindis",
    phrase: "La science des Anciens Dieux nous sauvera.",
    apparence:
      "Race unique par son mimétisme naturel : certains prennent l'apparence de branches, " +
      "d'autres de feuilles. Souvent très grands (huit à dix insètres de long), de couleur marron " +
      "ou grise. Corps extrêmement mince en tige effilée, membres longs et fins répartis sur un " +
      "thorax allongé. Démarche ample et lente, donnant un mouvement de balancier caractéristique. " +
      "Abdomen court et chitineux. Crâne rond et étroit malgré une intelligence rare ; antennes " +
      "longues, deux petits yeux ronds, bouche minuscule adaptée au broyage de végétaux.",
    societe: {
      titre: "Grandeur et puissance technologique",
      texte:
        "Peuple vivant essentiellement dans les royaumes du Nord, vénérant les Anciens Dieux et " +
        "se revendiquant le plus souvent de la vertuaire de l'Espérance. Cités splendides " +
        "défendues par des milices mantides à leur solde, bâties en métal et verre grâce à la " +
        "technologie des Anciens Dieux — sur de grands arbres pluricyclaires formant des coupoles " +
        "de métal, avec dômes de verre, balcons de métal, bâtiments de bois et de pierre en " +
        "logements, et un tronc creusé offrant un dédale interne défensif. Maîtres de la science " +
        "des Anciens Dieux, les Brindis mènent l'essentiel des recherches scientifiques et " +
        "technologiques d'Entoma à partir des vestiges retrouvés ; leurs prêtres contrôlent la " +
        "foudre ou maîtrisent l'alchimie. Leurs cités bénéficient de points lumineux et d'eau " +
        "courante par des artifices inconnus des autres peuples. L'Église du culte leur a confié " +
        "la mission de traduire et comprendre les vestiges technologiques — mission encore très " +
        "partiellement accomplie malgré des inventions notables : la lanterne, le crache-sang " +
        "fétide, la lunette astronomique, la maîtrise des forces hydrauliques et éoliennes, les " +
        "sceptres des prêtres des Anciens Dieux. Ils participent activement aux recherches des " +
        "sphères d'alchimie et de foudre."
    },
    organisationSociale:
      "La plupart des Brindis vivent en couple ; les femelles, vivant plus longtemps, choisissent " +
      "un nouveau mâle après le trépas du précédent (« prendre racine », leur nom du trépas). " +
      "Les œufs éclosent trois lonas après la ponte ; les jeunes sont autonomes dès la naissance " +
      "et atteignent l'âge adulte en six lonas, période durant laquelle ils restent en contact " +
      "avec leurs ancêtres qui leur transmettent leur savoir — un imago Brindis est donc déjà un " +
      "puits de science à l'entrée dans la société théocratique. Cités dirigées par des prêtres " +
      "des Anciens Dieux élevés au rang de « Populus », chargés de gouverner et défendre. Chaque " +
      "cycle, un dirigeant est élu par ses ancêtres pour devenir le Grand Quercus, qui dirige " +
      "l'ordre religieux (lignée des prêtres Populus et de leurs subalternes, les légats Ulmus). " +
      "Le Grand Quercus actuel se nomme Magnafollum III.",
    artEtLangage:
      "Polyglottes, assimilant rapidement de nouvelles langues. Langue natale, le ventel, à peine " +
      "perceptible — comme une brise légère caressant des feuilles, mêlée de grincements de " +
      "bois. Discussions longues et précises, prudence et respect dans l'échange, longue analyse " +
      "avant d'agir. Peuple le plus avancé d'Entoma en matière d'innovation et de sciences : " +
      "outils variés, victuailles et vêtements novateurs au quotidien. Apprécient la musique et " +
      "ont créé de nouveaux instruments forgés dans le cuivre, les trompes.",
    religion: {
      culte: "Cultiste (culte des Anciens Dieux)",
      details:
        "Ferveur immense pour le culte : les Titans (Anciens Dieux) ont légué des connaissances " +
        "fabuleuses ayant transformé la vie sur Entoma, et pour les Brindis, seuls les Titans " +
        "peuvent légitimement gouverner. Prêtres, Ulmus, Populus et Grand Quercus sont les " +
        "interprètes de la voix divine. Les Brindis espèrent, par ce savoir, atteindre la " +
        "condition des Titans pour la gloire de leur peuple et de ses alliés. Longtemps porteurs " +
        "de la vertu de l'Espérance au sein du culte (analyse prudente des dangers d'un vestige " +
        "ou d'un conflit avec les peuples du Sud), aujourd'hui plus partagés entre vertuaires mais " +
        "conservant une forte influence sur l'Espérance."
    },
    prejuges:
      "Cote de popularité particulièrement élevée chez les peuples cultistes (Myrmides, " +
      "Blatères, Apis, Putères) grâce à leurs découvertes (forge, épées de métal, architecture " +
      "métallique). Réputés calmes, réfléchis, respectueux et éloquents, mais peu courageux ou " +
      "combatifs — certains les jugent imbus d'eux-mêmes, coupés des préoccupations communes, " +
      "préférant la fourberie à l'affrontement franc. Malgré leur attachement viscéral au culte " +
      "des Anciens Dieux, la plupart des peuples animistes les respectent pour leur savoir, leur " +
      "prudence et leur rôle modérateur face à la fougue des Blatères ou de certains Myrmides — " +
      "tout en considérant leurs recherches comme un danger potentiel pour l'équilibre d'Entoma.",
    population:
      "Un peu plus d'un million d'individus, répartis majoritairement dans l'Empire des " +
      "Sarabandes, où se trouvent les plus grandes cités brindis (une centaine de milliers " +
      "d'habitants chacune au maximum). La plus grande et renommée, Orodalum, à l'ouest de " +
      "l'Empire, abrite le siège du Grand Quercus. Quelques cités brindis existent aussi dans les " +
      "Terres mielliques et le Royaume de Justice : chez les Apis, Kerjela brille par son Arbrorum " +
      "millénaire ; chez les Blatères, la petite cité de Mandasta alimente les rumeurs sur les " +
      "recherches de vestiges des Anciens Dieux. Le peuple se divise en trois lignées : les " +
      "Brindis (majorité), les Phyllis (chitine en forme de feuilles, corps aplati souvent vert, " +
      "camouflage sans égal, principalement dans l'Empire des Sarabandes), et les Troncis " +
      "(créatures gigantesques dépassant quinze insètres de long, jaunes ou vertes, chitine " +
      "épineuse, lentes et peu intelligentes mais redoutables au combat par leur masse et leur " +
      "chitine).",
    onomastique:
      "Noms généralement aussi longs que leur corps, consonnes longues et suaves (l, m, f, j, n). " +
      "Exemples : Lamenorin, Fojilane.",
    image: ""
  },

  cerk: {
    nomAffiche: "Cerk",
    phrase: "Nus nous arrivons, nus nous partirons. Au fils d'Onono nous devons tout. (Psaume de baptême cerk)",
    apparence:
      "Taille réduite, ne dépassant pas deux insètres de haut. Se tiennent debout, avec aisance, " +
      "sur leurs membres postérieurs — posture droite leur donnant une allure fière et digne. " +
      "Corps allongé, teintes uniformes brunes, jaunes ou ocres. Membres fins et anguleux ; crâne " +
      "en amande, de taille réduite malgré une grande intelligence. Petits yeux noirs, longues " +
      "antennes, bouche très petite. Signe distinctif : une pince démesurée à l'extrémité de " +
      "l'abdomen — membre supplémentaire servant à saisir, porter, découper ou se dresser pour " +
      "scruter l'horizon, et par laquelle les Contrôleurs d'énergies canalisent les forces de la " +
      "nature.",
    societe: {
      titre: "Un peuple tourné vers ses divinités",
      texte:
        "Peuple regroupé dans les terres d'Usurva, au centre du continent, jouxtant les montagnes " +
        "d'Arron à sa frontière nord, occupées depuis des milliers de cycles. Cités à " +
        "l'architecture énigmatique pour le reste d'Entoma, œuvres des Contrôleurs d'énergies qui " +
        "maîtrisent les forces de la nature par dévotion à la déesse mère Onono — un don leur " +
        "permettant de commander aux quatre éléments. Murs sculptés (non maçonnés) avec une " +
        "finesse inégalée, eau abondante par des mécanismes obscurs, quartiers parfois chauffés. " +
        "Armée cerk (combattants au sol + Contrôleurs) parmi les plus redoutées au monde, alliant " +
        "combat rapproché et magie destructrice puissante — ciblant surtout les royaumes " +
        "cultistes et l'Empire des Sarabandes, avec qui l'opposition religieuse (culte des " +
        "énergies contre culte des Anciens Dieux) engendre une haine viscérale et un fanatisme " +
        "déconcertant. Relations diplomatiques et économiques exécrables avec le Nord ; en " +
        "revanche bonne entente avec les Royaumes marchands et les royaumes frères de Coreus et " +
        "Gao, renforcée par le commerce du myceliol, algue médicinale très prisée produite par " +
        "les Cerks."
    },
    organisationSociale:
      "Le culte des énergies régit l'organisation sociale : abandonner cette religion est " +
      "passible de mort ou de bannissement. Société non fragmentée par des castes mais par des " +
      "conditions — seule la maîtrise des énergies et l'appartenance au clergé distingue les " +
      "prêtres du reste de la population, l'Église étant organisée selon un code hiérarchique " +
      "strict (obéissance des prêtres les plus insignifiants envers les plus puissants). Hors " +
      "clergé, égalité de droits et devoirs entre individus. Mâles et femelles unis pour une " +
      "période déterminée, renouvelable ; progéniture éduquée collectivement dans des couvoirs. " +
      "Absence notable de notion de propriété : biens et terres appartiennent au culte des " +
      "énergies (la terre mère) ; les prêtres décident donc de la répartition des revenus et " +
      "logements — la richesse des terres d'Usurva et la puissance des prêtres assurent " +
      "néanmoins un niveau de vie décent à tous les Cerks.",
    artEtLangage:
      "Parlent le kernim, langue complexe et musicale de plusieurs milliers de mots, très " +
      "pratiquée au quotidien — les Cerks aiment discourir toute la journée. Écriture connue et " +
      "utilisée depuis plus de deux mille cycles, mais chants, histoires et légendes se " +
      "transmettent le plus souvent oralement lors de veillées, rites et célébrations. Tradition " +
      "ancestrale de peintures rupestres, parfois gigantesques, rendant hommage aux dieux dans " +
      "les grottes ou sur les falaises — les versants des montagnes d'Arron en témoignent " +
      "largement.",
    religion: {
      culte: "Animiste (culte des énergies)",
      details:
        "Vénération fervente d'Onono, créateur de toutes choses, et de ses quatre enfants — Ono " +
        "Sunak, Ono Pirok, Ono Dabou et Ono Shellam — dominant chacun un élément naturel (eau, " +
        "terre, air, feu). Le culte des énergies, autrefois répandu chez d'autres peuples pour sa " +
        "puissance et son lien avec la mère nourricière, a été supplanté ailleurs par le culte " +
        "des Anciens Dieux ; les Cerks en sont aujourd'hui presque les seuls pratiquants et " +
        "rejettent les adorateurs des Anciens Dieux, tant pour des raisons religieuses que par " +
        "rivalité d'influence idéologique."
    },
    prejuges:
      "Perçus par la plupart des peuples d'Entoma comme fanatiques et obtus, nostalgiques d'un " +
      "empire disparu. Les Lulles et les Koks'ihnes, qui les connaissent mieux, les décrivent " +
      "comme des êtres purs, entiers et fiables — mais ce jugement favorable ne vaut que pour les " +
      "peuples animistes ; les athées et croyants du culte des Anciens Dieux entretiennent une " +
      "image réciproquement médiocre.",
    population:
      "Quatre à six millions d'individus dans les Terres d'Usurva (plaines, montagnes, collines " +
      "au sud des montagnes d'Arron), quelques centaines vivant hors de ces terres sacrées pour " +
      "raisons commerciales ou diplomatiques. Nation composée d'une seule ethnie. Quatre villes " +
      "principales, chacune dédiée à un élément et abritant une maison élémentaire du culte des " +
      "énergies dont les prêtres dirigent la cité : Néopté (capitale, dieu de la terre Ono Sunak, " +
      "ancienne myrmidière, bâtie dans un tronc d'arbre pétrifié géant aux galeries profondes), " +
      "Catacola (dieu de l'eau Ono Dabou, cité secrète fermée aux non-Cerks, centre de récolte et " +
      "conditionnement du myceliol, forte activité commerciale grâce à ses nefodromes reliant " +
      "Coreus aux royaumes marchands), Montgalh (dieu de l'air Ono Shellam, tour-cité de pierres " +
      "noires et lisses sur promontoire rocheux, sans trace de maçonnerie apparente, meilleurs " +
      "prêtres d'escorte des nefs lulles de la guilde des Transporteurs, population cosmopolite), " +
      "et Dabohad (dieu du feu Ono Pirok, bâtie au pied du volcan Dabou Retzak — à l'origine des " +
      "Terres d'Usurva il y a plus de deux mille cycles —, promontoire rocheux ceint d'une haute " +
      "muraille en demi-cercle face au volcan).",
    onomastique:
      "Sonorités en « ark », « erk », la lettre r étant fréquemment utilisée. Exemple : Danerk Tern.",
    image: ""
  },

  crinar: {
    nomAffiche: "Crinar",
    phrase: "Les kumis nous forgent, la chasse nous grandit.",
    apparence:
      "Souvent confondus avec leurs cousines les Crinelles, dont ils se distinguent par une " +
      "taille un peu plus réduite (trois à quatre insètres de haut) et des antennes deux fois " +
      "plus petites. Physionomie frappante par son aspect chitineux : corps, membres et visage " +
      "recouverts d'une épaisse armure naturelle donnant un air engoncé. Pas de cou apparent, " +
      "crâne enfoncé dans le corps et réduit, surmonté de deux grands yeux à facettes occupant " +
      "une large part du visage. Contrairement aux Crinelles, les Crinars volent sur de longues " +
      "distances grâce à deux paires d'ailes puissantes cachées sous d'épais élytres. Peuvent se " +
      "tenir sur leurs pattes arrière, mais utilisent le plus souvent aussi leurs pattes médianes " +
      "pour se maintenir.",
    societe: {
      titre: "Un peuple sauvage et fier",
      texte:
        "Peuple nomade vivant au cœur d'étendues sauvages. Par l'entremise de leurs chamans, les " +
        "Ypogas, ils entretiennent une relation forte avec les forces de la nature et leurs " +
        "divinités, et se déplacent dès qu'ils ont épuisé les ressources végétales d'une portion " +
        "de leurs terres. Les tribus acridiennes privilégient l'habitat naturel (arbres creux, " +
        "amas de rochers, cavités surélevées), chaque site étant choisi par l'Ypoga selon des " +
        "critères mystiques précis ; campements de bois et toiles tendues occupés deux cycles au " +
        "maximum. Les tribus du désert de Sangpal (Locustirs) vivent en oasis ou dans des collines " +
        "rocheuses. Répartition des tâches par sexe : les chasseurs s'occupent de la chasse et de " +
        "l'élevage de parasites (moucherons, cochenilles, pucerons), les femelles de l'éducation " +
        "des larves/imagos et de la cueillette. Point fort du peuple : sa capacité de survie — " +
        "chasseurs hors pair, maîtres du camouflage, gardiens des secrets de la nature, respectés " +
        "pour leur fougue, leur efficacité au combat et leur furtivité. Particularité unique : la " +
        "sérotonine, une glande du système digestif directement reliée à l'encéphale, qui gère " +
        "les besoins nutritionnels de l'insecte — considérée comme une faiblesse chez les " +
        "Acridiens, mais devenue une force maîtrisée chez les Locustirs."
    },
    organisationSociale:
      "Société tribale comptant un nombre incalculable de tribus, dirigées par un chef (le Caran) " +
      "conseillé par un Ypoga. Taille des tribus : de vingt à cinq cents intres, quasi toutes sous " +
      "domination des mâles chasseurs ; les femelles élèvent collectivement imagos et larves au " +
      "campement. Les unions sont pour la vie, la filiation étant un fondement social majeur — les " +
      "mâles guerriers/chasseurs assurent l'éducation martiale de leur progéniture pour former les " +
      "chasseurs les plus puissants de la tribu. Des joutes fréquentes valorisent combat, adresse, " +
      "astuce et force, et déterminent la position sociale de chaque mâle. Les plus faibles ou " +
      "malchanceux deviennent Barrins — chasseurs dominés par les autres, une position difficile " +
      "qui pousse nombre d'entre eux à quitter la tribu pour des cités cosmopolites ou des " +
      "compagnies de mercenaires.",
    artEtLangage:
      "Forte tradition orale. Parlent l'aphron, langage simple et guttural ponctué de " +
      "claquements de mandibules, nommé d'après le chant du kumi du printemps Aphr'Odyss. " +
      "L'écriture se limite à l'inscription de symboles, le plus souvent par les Ypogas. En " +
      "revanche, les Crinars affectionnent particulièrement le chant et les contes : en frottant " +
      "leurs ailes sur leurs élytres, les mâles chasseurs produisent un chant appelé stridulat, " +
      "utilisé lors de fêtes et rites religieux ou pour séduire les femelles. L'imaginaire crinar " +
      "regorge de contes mettant en scène les dieux de la nature, leurs représentants et les " +
      "différents peuples d'Entoma.",
    religion: {
      culte: "Animiste",
      details:
        "Les Crinars prient Onono comme la plupart des animistes, mais leurs chamans (les " +
        "Ypoga) louent depuis longtemps les dieux et démons des kumis, craints et invoqués avec " +
        "ferveur par tout le peuple : Rh'arh (démon de l'hiver et de la sécheresse), Aphr'Odyss " +
        "(déesse du printemps et de la fertilité), Oran Drah (démon de l'été et de la guerre), et " +
        "Mavuno (dieu de l'automne et des récoltes)."
    },
    prejuges:
      "Créatures méconnues et donc peu appréciées. Depuis la Grégaria — période très obscure de " +
      "l'histoire crinar —, une large part de la population d'Entoma les considère encore comme " +
      "des créatures insectophages dénuées d'intelligence ; leur isolement et leur manque " +
      "d'ouverture apparente en font souvent des boucs émissaires. Pourtant, la culture crinar, " +
      "bien que rustre, est chaleureuse et tolérante : le respect des dieux de la nature suffit à " +
      "être accueilli avec considération par ce peuple.",
    population:
      "Deux ethnies distinctes : les Acridiens des Terres d'Alcala (un à deux millions " +
      "d'individus, chitine bicolore à dominante verte) et les Locustirs du désert de Sangpal " +
      "(à peine quelques centaines de milliers, tons jaunâtres/bruns/noirs marqués par l'excès de " +
      "sérotonine). Seulement deux cités édifiées dans tout Entoma : Acrida, capitale des terres " +
      "d'Alcala, et Locustir, cité énigmatique du désert de Sangpal. " +
      "// À COMPLÉTER : d'autres particularités distinguant les deux ethnies (notamment au " +
      "niveau des ailes) sont mentionnées en fin de section mais coupées dans l'extrait " +
      "disponible — à vérifier page 34-35 du PDF avant validation finale.",
    onomastique: "// À COMPLÉTER — non localisé dans l'extrait disponible (p.28-34).",
    image: ""
  }

};
