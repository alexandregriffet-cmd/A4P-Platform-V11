export type PMPLikertQuestion = {
  id: string
  type: 'likert'
  dimension:
    | 'activation'
    | 'attention'
    | 'regulation'
    | 'engagement'
    | 'confiance'
    | 'resilience'
    | 'cognition'
    | 'motricite'
  label: string
  text: string
  reverse: boolean
}

export type PMPBinaryQuestion = {
  id: string
  type: 'binary'
  axis: 'ei' | 'sn' | 'tf' | 'jp'
  text: string
  optionA: string
  optionB: string
}

export type PMPQuestion = PMPLikertQuestion | PMPBinaryQuestion

export const PMP_QUESTIONS: PMPQuestion[] = [
  { id: 'Q1', type: 'likert', dimension: 'activation', label: 'Activation', text: "Avant une compétition, je me sens rapidement prêt à entrer dans l'action.", reverse: false },
  { id: 'Q2', type: 'likert', dimension: 'activation', label: 'Activation', text: "J'ai besoin de beaucoup de temps pour me mettre en rythme avant d'être performant.", reverse: false },
  { id: 'Q3', type: 'likert', dimension: 'activation', label: 'Activation', text: "Quand l'intensité monte, mon énergie mentale augmente aussi.", reverse: false },
  { id: 'Q4', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je démarre souvent trop doucement dans les premières minutes.', reverse: true },
  { id: 'Q5', type: 'likert', dimension: 'activation', label: 'Activation', text: "Je me sens stimulé par l'ambiance compétitive.", reverse: false },
  { id: 'Q6', type: 'likert', dimension: 'activation', label: 'Activation', text: "Quand il y a de l'enjeu, je me réveille mentalement.", reverse: false },
  { id: 'Q7', type: 'likert', dimension: 'activation', label: 'Activation', text: "Je manque souvent d'allant au moment où il faut accélérer.", reverse: true },
  { id: 'Q8', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je sais mobiliser mon énergie quand il faut répondre présent.', reverse: false },
  { id: 'Q9', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je ressens une dynamique positive quand le défi est élevé.', reverse: false },
  { id: 'Q10', type: 'likert', dimension: 'activation', label: 'Activation', text: "Je subis parfois le rythme au lieu de l'imposer.", reverse: true },
  { id: 'Q11', type: 'likert', dimension: 'activation', label: 'Activation', text: "Je peux élever mon niveau d'activation sans m'éparpiller.", reverse: false },
  { id: 'Q12', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je me sens trop passif dans les moments décisifs.', reverse: true },
  { id: 'Q13', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je transforme facilement la tension en énergie utile.', reverse: false },
  { id: 'Q14', type: 'likert', dimension: 'activation', label: 'Activation', text: "Je manque parfois d'intensité alors que la situation l'exige.", reverse: true },
  { id: 'Q15', type: 'likert', dimension: 'activation', label: 'Activation', text: 'Je me mets mentalement en route assez vite.', reverse: false },

  { id: 'Q16', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je reste concentré même quand l'environnement est bruyant.", reverse: false },
  { id: 'Q17', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je me laisse facilement distraire pendant l'entraînement ou le match.", reverse: true },
  { id: 'Q18', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je reviens vite à l'instant présent après une erreur.", reverse: false },
  { id: 'Q19', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Mon attention décroche dès que la séance dure longtemps.', reverse: true },
  { id: 'Q20', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je sais me refocaliser sur une consigne importante.', reverse: false },
  { id: 'Q21', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Quand plusieurs choses se passent en même temps, je garde le bon repère.', reverse: false },
  { id: 'Q22', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je pense trop à autre chose pendant la performance.', reverse: true },
  { id: 'Q23', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je suis capable de me reconcentrer très vite.', reverse: false },
  { id: 'Q24', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je garde le fil du jeu même sous pression.', reverse: false },
  { id: 'Q25', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je perds parfois ma concentration sur des détails inutiles.', reverse: true },
  { id: 'Q26', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je peux maintenir mon attention jusqu'à la fin.", reverse: false },
  { id: 'Q27', type: 'likert', dimension: 'attention', label: 'Attention', text: "Mon esprit part facilement ailleurs avant un geste important.", reverse: false },
  { id: 'Q28', type: 'likert', dimension: 'attention', label: 'Attention', text: 'Je sais quoi regarder au bon moment.', reverse: false },
  { id: 'Q29', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je m'éparpille quand le contexte devient complexe.", reverse: false },
  { id: 'Q30', type: 'likert', dimension: 'attention', label: 'Attention', text: "Je suis présent mentalement sur ce que j'ai à faire.", reverse: false },

  { id: 'Q31', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je garde un certain calme quand la pression monte.', reverse: false },
  { id: 'Q32', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Mes émotions prennent parfois trop de place dans ma performance.', reverse: true },
  { id: 'Q33', type: 'likert', dimension: 'regulation', label: 'Régulation', text: "Je sais faire redescendre la tension quand j'en ai besoin.", reverse: false },
  { id: 'Q34', type: 'likert', dimension: 'regulation', label: 'Régulation', text: "Une frustration peut me poursuivre longtemps pendant l'effort.", reverse: false },
  { id: 'Q35', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je retrouve assez vite mon équilibre émotionnel.', reverse: false },
  { id: 'Q36', type: 'likert', dimension: 'regulation', label: 'Régulation', text: "Je gère plutôt bien l'agacement après une décision injuste.", reverse: false },
  { id: 'Q37', type: 'likert', dimension: 'regulation', label: 'Régulation', text: "Quand quelque chose m'énerve, cela dérègle facilement mon jeu.", reverse: false },
  { id: 'Q38', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je sais respirer et me recentrer dans les moments tendus.', reverse: false },
  { id: 'Q39', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je ne me laisse pas dominer trop longtemps par le stress.', reverse: true },
  { id: 'Q40', type: 'likert', dimension: 'regulation', label: 'Régulation', text: "Je monte vite en émotion et j'ai du mal à redescendre.", reverse: false },
  { id: 'Q41', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je peux rester stable après un événement contrarié.', reverse: false },
  { id: 'Q42', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Une erreur me fait parfois sortir de mon match émotionnellement.', reverse: true },
  { id: 'Q43', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je sais réguler mon niveau de tension intérieure.', reverse: false },
  { id: 'Q44', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je me crispe facilement quand je veux trop bien faire.', reverse: true },
  { id: 'Q45', type: 'likert', dimension: 'regulation', label: 'Régulation', text: 'Je retrouve mon axe émotionnel après un moment difficile.', reverse: true },

  { id: 'Q46', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je m'implique pleinement dans ce que j'ai à faire.", reverse: false },
  { id: 'Q47', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Quand c'est difficile, j'ai parfois tendance à lâcher intérieurement.", reverse: true },
  { id: 'Q48', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je fournis mes efforts même quand je ne suis pas en réussite.", reverse: false },
  { id: 'Q49', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je reste investi jusqu'au bout de la séance ou du match.", reverse: false },
  { id: 'Q50', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Mon niveau d'engagement dépend trop de mon humeur du moment.", reverse: true },
  { id: 'Q51', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je vais au contact du défi plutôt que de l'éviter.", reverse: false },
  { id: 'Q52', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je garde de l'intention même quand la fatigue arrive.", reverse: false },
  { id: 'Q53', type: 'likert', dimension: 'engagement', label: 'Engagement', text: 'Je me désengage parfois si la situation tourne mal.', reverse: true },
  { id: 'Q54', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je suis capable de maintenir mon intensité mentale dans l'effort.", reverse: false },
  { id: 'Q55', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je continue à chercher des solutions quand c'est compliqué.", reverse: false },
  { id: 'Q56', type: 'likert', dimension: 'engagement', label: 'Engagement', text: 'Quand je doute, mon implication baisse rapidement.', reverse: true },
  { id: 'Q57', type: 'likert', dimension: 'engagement', label: 'Engagement', text: "Je prends ma part dans l'effort collectif.", reverse: false },
  { id: 'Q58', type: 'likert', dimension: 'engagement', label: 'Engagement', text: 'Je reste combatif même après plusieurs difficultés.', reverse: false },
  { id: 'Q59', type: 'likert', dimension: 'engagement', label: 'Engagement', text: 'Je peux perdre mon envie de me battre quand je suis contrarié.', reverse: false },
  { id: 'Q60', type: 'likert', dimension: 'engagement', label: 'Engagement', text: 'Je tiens mentalement mon engagement sur la durée.', reverse: false },

  { id: 'Q61', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je crois en ma capacité à réussir dans les moments importants.", reverse: false },
  { id: 'Q62', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je doute souvent de moi avant un événement important.', reverse: true },
  { id: 'Q63', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je peux m'appuyer sur mes qualités quand l'enjeu augmente.", reverse: false },
  { id: 'Q64', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Une erreur peut rapidement faire baisser ma confiance.', reverse: false },
  { id: 'Q65', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je me sens capable de répondre présent face à l'adversité.", reverse: false },
  { id: 'Q66', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "J'entre parfois en compétition avec l'idée que cela va être trop dur pour moi.", reverse: true },
  { id: 'Q67', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je garde un minimum de certitude même quand je traverse un passage difficile.', reverse: true },
  { id: 'Q68', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je me compare souvent aux autres d'une manière qui me fragilise.", reverse: false },
  { id: 'Q69', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je m'appuie sur mes repères pour rester solide intérieurement.", reverse: false },
  { id: 'Q70', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Mon estime de mes capacités varie trop selon mes derniers résultats.', reverse: true },
  { id: 'Q71', type: 'likert', dimension: 'confiance', label: 'Confiance', text: "Je peux me faire confiance sans avoir besoin d'être parfait.", reverse: false },
  { id: 'Q72', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je me sens parfois inférieur aux autres dans les moments qui comptent.', reverse: true },
  { id: 'Q73', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je sais reconnaître mes points forts.', reverse: false },
  { id: 'Q74', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je laisse facilement un détail négatif éteindre ma confiance.', reverse: true },
  { id: 'Q75', type: 'likert', dimension: 'confiance', label: 'Confiance', text: 'Je crois en ma marge de progression.', reverse: false },

  { id: 'Q76', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je rebondis assez vite après un échec ou une erreur.', reverse: false },
  { id: 'Q77', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je rumine longtemps quand quelque chose se passe mal.', reverse: true },
  { id: 'Q78', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je sais repartir après un moment compliqué.', reverse: false },
  { id: 'Q79', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Un mauvais passage peut me faire sortir durablement de ma performance.', reverse: true },
  { id: 'Q80', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je transforme souvent les difficultés en apprentissage.', reverse: false },
  { id: 'Q81', type: 'likert', dimension: 'resilience', label: 'Résilience', text: "Je mets parfois beaucoup de temps à me remettre d'une déception.", reverse: false },
  { id: 'Q82', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je peux repartir proprement après avoir subi un coup dur.', reverse: false },
  { id: 'Q83', type: 'likert', dimension: 'resilience', label: 'Résilience', text: "Je garde l'idée que rien n'est fini après une erreur.", reverse: false },
  { id: 'Q84', type: 'likert', dimension: 'resilience', label: 'Résilience', text: "Je reste bloqué trop longtemps sur ce qui n'a pas marché.", reverse: true },
  { id: 'Q85', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je reprends vite le fil après une contre-performance.', reverse: false },
  { id: 'Q86', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je tire des leçons utiles de mes difficultés.', reverse: false },
  { id: 'Q87', type: 'likert', dimension: 'resilience', label: 'Résilience', text: "Un échec me touche parfois plus longtemps que je ne le voudrais.", reverse: false },
  { id: 'Q88', type: 'likert', dimension: 'resilience', label: 'Résilience', text: "Je sais me reconstruire dans l'action.", reverse: false },
  { id: 'Q89', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je peux reprendre confiance après un passage raté.', reverse: false },
  { id: 'Q90', type: 'likert', dimension: 'resilience', label: 'Résilience', text: 'Je me relève mentalement quand la situation se complique.', reverse: false },

  { id: 'Q91', type: 'likert', dimension: 'cognition', label: 'Cognition', text: "J'aime comprendre en profondeur ce qu'il faut faire pour progresser.", reverse: false },
  { id: 'Q92', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je préfère agir sans trop analyser ce que je fais.', reverse: true },
  { id: 'Q93', type: 'likert', dimension: 'cognition', label: 'Cognition', text: "Je repère assez vite les logiques d'une situation de jeu.", reverse: false },
  { id: 'Q94', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je comprends bien les liens entre stratégie, intention et exécution.', reverse: false },
  { id: 'Q95', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je prends parfois des décisions sans vraiment lire ce qui se passe.', reverse: false },
  { id: 'Q96', type: 'likert', dimension: 'cognition', label: 'Cognition', text: "J'aime anticiper plusieurs options avant d'agir.", reverse: false },
  { id: 'Q97', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je vois facilement comment adapter mon comportement à la situation.', reverse: false },
  { id: 'Q98', type: 'likert', dimension: 'cognition', label: 'Cognition', text: "Je peux manquer de lucidité tactique quand l'action s'accélère.", reverse: false },
  { id: 'Q99', type: 'likert', dimension: 'cognition', label: 'Cognition', text: "J'apprends mieux quand je comprends le sens de l'exercice.", reverse: false },
  { id: 'Q100', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je repère les indices utiles pour prendre une bonne décision.', reverse: false },
  { id: 'Q101', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je réfléchis volontiers à ce qui me fait progresser.', reverse: false },
  { id: 'Q102', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je peine parfois à analyser calmement ce qui se passe.', reverse: true },
  { id: 'Q103', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je peux relier mes sensations à des repères concrets.', reverse: false },
  { id: 'Q104', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je lis souvent la situation avec un temps de retard.', reverse: false },
  { id: 'Q105', type: 'likert', dimension: 'cognition', label: 'Cognition', text: 'Je développe de la clarté quand je prends du recul.', reverse: false },

  { id: 'Q106', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "Je ressens facilement comment mon corps s'organise dans le mouvement.", reverse: false },
  { id: 'Q107', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "Je manque parfois de repères corporels pendant l'action.", reverse: true },
  { id: 'Q108', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je perçois assez vite si mon geste est juste ou non.', reverse: false },
  { id: 'Q109', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "Je comprends mieux quand on me montre et que je ressens l'action.", reverse: false },
  { id: 'Q110', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je me sens parfois coupé de mes sensations dans le mouvement.', reverse: true },
  { id: 'Q111', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je repère comment mon équilibre influence mon efficacité.', reverse: false },
  { id: 'Q112', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je trouve assez vite une manière personnelle de réaliser un geste.', reverse: false },
  { id: 'Q113', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "J'ai besoin de beaucoup de répétitions pour sentir un mouvement juste.", reverse: false },
  { id: 'Q114', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je sens assez bien ce qui change dans mes appuis et mon rythme.', reverse: false },
  { id: 'Q115', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je peux adapter mon geste sans tout perdre mentalement.', reverse: false },
  { id: 'Q116', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "Je perçois rapidement les effets d'une correction technique.", reverse: false },
  { id: 'Q117', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je me sens parfois trop rigide dans mon organisation corporelle.', reverse: true },
  { id: 'Q118', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je fais confiance à mes sensations pour ajuster mon mouvement.', reverse: false },
  { id: 'Q119', type: 'likert', dimension: 'motricite', label: 'Motricité', text: "Je peine à identifier ce qui change dans mon corps quand je réussis.", reverse: true },
  { id: 'Q120', type: 'likert', dimension: 'motricite', label: 'Motricité', text: 'Je comprends la relation entre sensation, geste et efficacité.', reverse: false },

  { id: 'Q121', type: 'binary', axis: 'ei', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Après une séance importante, je récupère surtout en échangeant avec les autres.", optionB: "Après une séance importante, je récupère surtout en me retrouvant seul." },
  { id: 'Q122', type: 'binary', axis: 'ei', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: 'Dans un groupe, je prends facilement la parole.', optionB: 'Dans un groupe, je préfère observer avant de parler.' },
  { id: 'Q123', type: 'binary', axis: 'ei', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "L'énergie collective me stimule pendant la compétition.", optionB: 'Je performe mieux quand je reste dans ma bulle.' },
  { id: 'Q124', type: 'binary', axis: 'ei', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Avant un match, j'aime être au contact de l'ambiance.", optionB: "Avant un match, j'aime préserver mon espace intérieur." },

  { id: 'Q125', type: 'binary', axis: 'sn', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je fais confiance à ce que j'observe concrètement.", optionB: 'Je repère vite les possibilités cachées derrière la situation.' },
  { id: 'Q126', type: 'binary', axis: 'sn', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "J'apprends mieux à partir d'exemples précis.", optionB: "J'apprends mieux à partir d'idées et de liens globaux." },
  { id: 'Q127', type: 'binary', axis: 'sn', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: 'Je préfère des consignes claires et concrètes.', optionB: "Je préfère comprendre l'intention générale pour adapter ensuite." },
  { id: 'Q128', type: 'binary', axis: 'sn', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je m'appuie d'abord sur les faits du moment.", optionB: "Je m'appuie d'abord sur ce qui pourrait arriver ensuite." },

  { id: 'Q129', type: 'binary', axis: 'tf', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je décide d'abord selon ce qui me semble logique et efficace.", optionB: "Je décide d'abord en tenant compte des personnes et du ressenti." },
  { id: 'Q130', type: 'binary', axis: 'tf', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: 'Pour progresser, je préfère un retour direct et objectif.', optionB: 'Pour progresser, je préfère un retour nuancé et humain.' },
  { id: 'Q131', type: 'binary', axis: 'tf', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: 'En situation difficile, je tranche assez rationnellement.', optionB: "En situation difficile, j'accorde beaucoup de place au ressenti." },
  { id: 'Q132', type: 'binary', axis: 'tf', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je me sens à l'aise avec une évaluation franche.", optionB: "Je me sens à l'aise avec une évaluation formulée avec tact." },

  { id: 'Q133', type: 'binary', axis: 'jp', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je préfère préparer les choses à l'avance et structurer mon cadre.", optionB: 'Je préfère garder de la souplesse et m’adapter au fil de la situation.' },
  { id: 'Q134', type: 'binary', axis: 'jp', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "Je suis rassuré quand l'organisation est claire.", optionB: "Je suis plus à l'aise quand il reste de la liberté." },
  { id: 'Q135', type: 'binary', axis: 'jp', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: "J'aime fermer les sujets et savoir où je vais.", optionB: "J'aime laisser plusieurs options ouvertes." },
  { id: 'Q136', type: 'binary', axis: 'jp', text: "Choisis l'affirmation qui te ressemble le plus.", optionA: 'Je préfère des routines stables.', optionB: 'Je préfère une organisation vivante qui peut bouger.' },
]
