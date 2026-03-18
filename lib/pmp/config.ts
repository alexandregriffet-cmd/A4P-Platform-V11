export const PMP_DIMENSIONS = {
  activation: {
    label: 'Activation',
    description:
      "Capacité à mobiliser son énergie mentale avant et pendant la performance.",
    low: "Peut traduire un démarrage lent, une prudence excessive ou une difficulté à entrer pleinement dans le défi.",
    high: "Traduit souvent une bonne capacité à se mettre rapidement en action et à élever son niveau d'intensité.",
  },
  attention: {
    label: 'Attention',
    description:
      "Capacité à rester focalisé sur l'essentiel malgré les distractions.",
    low: "Peut indiquer une dispersion, une difficulté à revenir dans l'instant ou à tenir son repère.",
    high: 'Traduit souvent une bonne concentration et une capacité à se refocaliser rapidement.',
  },
  regulation: {
    label: 'Régulation',
    description:
      'Capacité à gérer ses émotions et sa tension intérieure.',
    low: "Peut signaler une sensibilité marquée au stress, à la frustration ou à l'erreur.",
    high: 'Traduit souvent une stabilité émotionnelle utile dans les moments exigeants.',
  },
  engagement: {
    label: 'Engagement',
    description:
      "Capacité à rester impliqué, volontaire et mobilisé dans l'effort.",
    low: "Peut signaler un décrochage intérieur lorsque la difficulté augmente.",
    high: 'Traduit une forte implication et une présence mentale durable.',
  },
  confiance: {
    label: 'Confiance',
    description:
      'Croyance en ses capacités à répondre présent et à progresser.',
    low: 'Peut révéler du doute, une fragilité sous pression ou une dépendance trop forte au résultat.',
    high: 'Traduit une solidité intérieure et un appui mobilisable dans les moments importants.',
  },
  resilience: {
    label: 'Résilience',
    description:
      "Capacité à rebondir après l'erreur, l'échec ou le contretemps.",
    low: 'Peut montrer une tendance à ruminer et à rester bloqué après un passage difficile.',
    high: "Traduit une capacité à repartir, apprendre et se reconstruire dans l'action.",
  },
  cognition: {
    label: 'Cognition',
    description:
      'Capacité à comprendre, analyser, anticiper et décider avec lucidité.',
    low: "Peut traduire une lecture tardive de la situation ou un manque de recul stratégique.",
    high: 'Traduit une bonne clarté mentale et une lecture efficace des situations.',
  },
  motricite: {
    label: 'Motricité',
    description:
      'Capacité à ressentir, organiser et ajuster le mouvement.',
    low: "Peut signaler peu de repères corporels ou une difficulté à sentir l'ajustement juste.",
    high: 'Traduit un lien fin entre sensation, geste et efficacité.',
  },
} as const

export const MBTI_TO_MOTOR: Record<string, string> = {
  ESTP: 'D1',
  ISTP: 'D2',
  ESTJ: 'D3',
  ISTJ: 'D4',
  ESFP: 'G1',
  ISFP: 'G2',
  ESFJ: 'G3',
  ISFJ: 'G4',
  ENFP: 'R1',
  INFP: 'R2',
  ENFJ: 'R3',
  INFJ: 'R4',
  ENTP: 'C1',
  INTP: 'C2',
  ENTJ: 'C3',
  INTJ: 'C4',
}

export const PMP_PROFILES: Record<string, string[]> = {
  Compétiteur: ['activation', 'engagement', 'confiance'],
  Stratège: ['cognition', 'attention', 'regulation'],
  Créatif: ['cognition', 'activation', 'motricite'],
  Régulateur: ['regulation', 'attention', 'resilience'],
  Endurant: ['resilience', 'engagement', 'confiance'],
  Méthodique: ['attention', 'motricite', 'cognition'],
}

export const MOTOR_FAMILIES: Record<string, string> = {
  D: 'ST',
  G: 'SF',
  R: 'NF',
  C: 'NT',
}

export function pmpScoreBand(score: number) {
  if (score >= 80) return 'force mentale'
  if (score >= 60) return 'zone solide'
  if (score >= 40) return 'zone moyenne'
  return 'zone de travail'
}
