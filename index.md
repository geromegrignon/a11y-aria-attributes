# L'UX accessible : Exploitez le potentiel des attributs ARIA

Nous avons la capacité de modeler une interface mais nous oublins bien vite notre responsabilité de modeler l'expérience utilisateur.


Si associer UX et Accessibilité peut sembler non seulement naturel mais indissociable pour certains, cette évidence ne l'est pas pour tous.
Elle ne l'est pas pour tous dans le contexte actuel où, si l'accessibilité n'en est pas une nouveauté, elle en devient une obligation légale.

Pour beaucoup cela devient un problème à régler, une anomalie, un déflect dont la résolution est parfois trop associée à une seule résolution technique, du code à adapter grâce à nos chers développeurs.

Mais si leur participation est nécessaire pour permettre de rendre un produit numérique accessible à tous, ce ne sont pas les seuls acteurs de l'accessibilité.

Et au delà même de profils d'UX designers, penser l'accessibilité c'est garantir uneprmesse qui dure, et qui nécessite donc, au même titre que les necessités des QA, d'être régulièrmeent rmeise en qusution ,challengée, contrôlée.


Rendre accessible, c'est s'assurer que tout le monde puisse utiliser les services mis à disposition par nos produits numériques.
115

Si les écoles intègrent de plus en plus une acculturation à l'accesssbiilité dans leur cursus, c'est encore plusieurs géénrations de développeurs non avertis sur le sujet.

Et si le sujet est complexe il y a pourtant bien un moyen à portée de main qui permet de travailler à l'atteinte d'une accessibilité pour tous.

HTML

Si ce système de balisage nous accompagne depuis les débuts d'internet, il a su évolué avec lui, avec ses pratiques et ses besoins.

151

## Ne pas utiliser ARIA

// expiquer ARIA

Parmi ces évolutions, des patterns se sont déssinés, donnant forme à des usages qu'il était difficile d'ignorer et laissant place à une opportunité de faire évoluer la façon de travailler.

De la déclaration systématique de certains attributs, nous sommes passés à des tags dédiés.

// exemple button exemple selectlist

Un autre exemple qui arrive bientôt à son achèvement est l'utilisation des role de region: header, footer,..search
Plus tôt cette année, search a été soumis à implémentation comme tag à proprement parlé.

Ainsi dans cette logique de nombreux tags html protent avec eux tout un sens, toute une identité propre: une sémantique.

Ce HTML sémantique permet d'uniformiser les pratiques tout en simplifiant son usage, nul besoin aujourd'hui de spécifier

// todo ceci
// todo ou cela

320

Si l'objectif de cette présentation est d'aller au delà de leur simple usage, il ne sont pas à négliger,
car au delà de leur utilité, ils sont un pont de lexique à portée de main pour faciliter la communication entre designers et développeurs.

Il existe néanmoins des cas à la marge. Car si nous sommes en mesure de facilement expliquer ce que sont les éléments, leur usage, leur intégration dans un parcours utilisateur peut être plus nbuleux.
Surtout quand leur compréhension est lié à notre perception.

Car au travers de nos sens ou d'un intermédiaire, c'est bien notre perception qui détermine notre expérience utilisateur.

// todo expliquer

HTML nous met donc à disposition un ensemble d'attributs permettant d'enrichir le html de nos applications pour apporter plus de sens à l'expéreince utilisateur.


Laissez vous bercer par la découverte de ces attributs

// labyrinthe de pan créature yeux mains

Ok ça c'était pour vous réveiller.

<p>En tant que développeur, nous sommes les premiers symptomes de ce problème</p>
						<p>écran de grande qualité</p>
						<p>éclairage optimisé</p>
						<p>connexion internet de qualité</p>
						<p>si ce n'est àà citer qu'un exemple, il en est celui des New Yorkais: 1?2 million d'utilisateurs quotidiens dans le métro avec une connexion limitée</p>


On peut corriger certains éléments facilement en prenant le temps d'en vocaliser l'intention.
Car derrirèe de nombreuses occasions manquées se cache le manque de détails sur l'intetion de l'élement de l'interface:

c'est un lien
c'est un bouton,
c'est un titre

Cela semble naturel mais pourtant si facilement en décalage dans le lexique d'un développeur ou celui d'un designer.

500

## aria-label
## aria-hidden

Vous n'en avez peut-être pas besoin

// christian clavier les poches vides

// meilleure solution pour les images/icons (title, aria label alt)

## aria-disabled

Pour répondre à de nombreux besoins dans nos applications, nous désactivons un bouton, pour en bloquer l'exécution et de fait l'interaction avec l'utilisateur.
Cependant cet usage est pour la plupart inapproprié.

Inapproprié car une solution de facilité pour le développeur, mais qui ne répond pas aux besoins de l'utilisateur.
La désactivation du bouton apparait comme un garde fou, offrant une piètre expérience utilisateur.

// exemple papa papa papa papa papa papa sur le trouble cognitif.
// trouver un exemple avec personne occupé dans un film

Comment faire pour activer le bouton?

2galement inapproprié car la désactivation du bouton n'est pas accessible.
En effet la désactiivation passe dans la majorité des cas par l'utilisation de l'attribut `disabled`.

Si c'est attribut remplit bien son rôle de désactiver l'exécution des events sur le bouton et qu'il propose par design un style visuel adapté et reconnu, il n'est pas accessible.

Il n'est pas accessible car ignoré par les technologies d'assistance et la navigation par tabulation.

Pourtant dans la majorité des cas de son utilisation, il ne s'agit pas juste de rendre une fonctionnalité statiquement indisponible, mais plutôt d'en rendre l'exécution conxtextuelle:

830

Par exmeple:

- on ne va soumettre un formulaire que si les champs sont valides
- on ne va supprimer un élément que si il est sélectionné
- on ne va permettre d'accéder à un widget que si l'utilisateur a les droits

Or en désactivant purement le bouton, il disparaît de la perception de l'utilisateur, rendant la fonctionnalité qu'il porte inaccessible.

Pour répondre à ce besoin, il existe l'attribut `aria-disabled` qui permet de désactiver un élément tout en le rendant accessible.
Cet attribut permet de conserver l'information tout en signifiant à l'utilisateur que l'élément est désactivé.

Néanmoins l'utilisation de cet attribut requière quelques adaptations car:
- il ne bloque plus programmatiquement l'exécution des events
- il ne propose pas de style visuel par défaut

Pour répondre à ces besoins, il faut donc:

- désactiver l'exécution des events
- proposer un style visuel adapté


### aria-current

Quand il s'agit de signifier la présence d'un élément à l'écran, son utilité peut ne pas être comprise en vocalisant l'élément en isolation
// afficher une star

mais bien en fonction de son contexte

// afficher toutes les stars

### aria-valuemin

Si aria-current nous permet d'identfier l'état sur une liste d'éléments, cette information est statique.
Qu'en est-til quand on souhaite véhiculer un progression?

HTML nous prpose à cet usage <progres> mais comme de nombreux éléments HTML, son rendu peut ne pas correspondre avec notre design system.

Et si pour ce cas nous pouvons être amené à créé un élement custom, c'est une nouvelle fois l'occasion d'apprécier les éléments html natives et la sémantique qu'ils portent.

Pourquoi l'usage d'attributs est importante dans cette situation?
Parce qu'une nouvelle fois, il ne s'agit pas de limiter notre perception à la vision que nous portons sur cet élément.
Il doit porter les règles d'accessibilité pour parler de lui-même.

De quoi est consituté une progression?
- d'un début
- d'une fin
- et d'un état

Et au delà de connaitre l début et la fin, c'est tout particulièrement la notion d'un état en progresison qui permet de porter l'information qu'il ne s'agit pas juste d'un pourcentage statique, comme on pourrait en avoir besoin dans certaines situations.

Pour rendre cet élément accessible il faut donc y associer un attribut pour chacune de ces informations

-valuemin
-valuemax
- ...

### aria-live

Si les éléments précédents sont perceptibles via une exploration progressive et linéaire du contenu proposé par la page, certains événements dans le parcours utilisateur nécessitent d'intterompre l'attention de ce dernier.

// trouver un gif  genre tarte creme dans la figure

Dans un monde où tout le monde cherche notre attention et que la publicité est omniprésente, elle se pose en référence dans sa capacité à capter l'attention.

// exemple dinosaure retour vers le futur (plutôt que le précédent)

De ces codes on peut retenir plus éléments clefs:

- pour attirer l'attention, l'information doit ressortir du rendu plus classique de la page
- la portée de l'iformation ne peut se mesurer qu'à une couleur appliqué au texte

Malgré tout ces éléments restent purement visuels.
Comme signifier à un lecteur d'écran qu'une information doit attirer l'atention au point d'en interrompre la lecture en cours?

Pour cela HTML propose l'attribut aria-live.
Cet attribut permet de signifier l'arrivée d'une information en live dont le contenu doit être porté à l'attention de l'utlisateur.

Cet attribut prend 2 valeurs possibles pour adapter l'interruption de la lecture du contenu en cours:

polite, comme son nom l'indique attend courtoisement quel le lecteur est fini son élocution en cours

assertive, moins courtois, vient interrompre votre flirt en cours et ruiner ce moment magique

// intégrer gif romantique


## aria-busy

Mais que faire pour signifier qu'une exécution est en cours et qu'un contenu est en attente de chargement?

aria-live: The aria-live is related to aria-busy because they both notify assistive technology that a particular element is being changed or done updating before notifying its user. The aria-live command defines the type of updates to assistive technologies and what their users should expect from the live region.
aria-relevant: The aria-relevant is related to aria-busy because they both send information to their users and there have been modifications with a certain element. The aria-relevant indicates what user agent notice will be triggered when a live region’s accessibility tree is updated.
aria-atomic: The aria-atomic is related to aria-busy because they both signify an element is being changed, and assistive technology may prefer to wait before notifying the user. The aria-atomic determines whether assistive technologies will provide all or part of a modified region based on the aria-relevant characteristic.


## aria-controls


## Conclusion

Si vous devez retenir une information de ces 20 minutes, c'est de toujours challenger la perception sans vous fier de manière instinctive à vos propres sens.
Laissez votre code parler!
