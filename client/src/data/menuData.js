const createVariants = () => [
  {
    id: 'one-person',
    label: '1 Person',
    serves: 1,
    weight: null,
    price: null,
  },
  {
    id: 'three-person',
    label: '3 Persons',
    serves: 3,
    weight: null,
    price: null,
  },
  {
    id: 'five-person',
    label: '5 Persons',
    serves: 5,
    weight: null,
    price: null,
  },
]

const menuData = [
  {
    id: 'baked-cheesecake',
    name: 'Baked Cheesecake',
    category: 'Baked Cheesecake',

    currentListedSize: '300g',
    currentListedPrice: 200,

    products: [
      {
        id: 'cream-baked-cheesecake',
        name: 'Cream Baked Cheesecake',
        description:
          'Rich, velvety and baked to golden perfection featuring a smooth dense cream cheese filling resting on a buttery toasted graham crust. Pure classic comfort in every decadent bite.',
        variants: createVariants(),
      },

      {
        id: 'blueberry-baked-cheesecake',
        name: 'Blueberry Baked Cheesecake',
        description:
          'Golden-baked cheesecake crowned with a vibrant topping of sweet, tangy blueberries and set over a buttery biscuit crust. A perfect balance of smooth silky creaminess and bright fruit flavor.',
        variants: createVariants(),
      },

      {
        id: 'strawberry-baked-cheesecake',
        name: 'Strawberry Baked Cheesecake',
        description:
          'Velvety slow-baked cheesecake topped with a vibrant glisten of fresh, ripe strawberries and a sweet strawberry reduction, anchored by a buttery cookie crust. A classic harmony of dense, luxurious creaminess and bright, juicy sweetness.',
        variants: createVariants(),
      },

      {
        id: 'pineapple-baked-cheesecake',
        name: 'Pineapple Baked Cheesecake',
        description:
          'Golden-baked, velvety cream cheese layered with a vibrant tropical pineapple glaze and crushed fruit, all nestled on a buttery, toasted biscuit crust. A refreshing twist that pairs rich, dense creaminess with bright, sunny sweetness.',
        variants: createVariants(),
      },

      {
        id: 'mango-baked-cheesecake',
        name: 'Mango Baked Cheesecake',
        description:
          'Smooth golden-baked cheesecake infused with rich creaminess and topped with a vibrant, tropical mango glaze and sweet fruit chunks set over a buttery biscuit base. Pure sunshine that pairs luscious richness with bright velvety mango sweetness.',
        variants: createVariants(),
      },

      {
        id: 'caramel-baked-cheesecake',
        name: 'Caramel Baked Cheesecake',
        description:
          'Rich, slow baked cream cheese swirled and draped with a silky, golden caramel glaze all anchored on a warm buttery biscuit crust. A deeply indulgent treat featuring a ribbon of buttery sweetness balanced by a hint of toasted warmth in every bite.',
        variants: createVariants(),
      },

      {
        id: 'nutella-baked-cheesecake',
        name: 'Nutella Baked Cheesecake',
        description:
          'Creamy cheesecake topped with rich Nutella delivering a velvety texture and an indulgent melt-in-mouth finish.',
        variants: createVariants(),
      },

      {
        id: 'lotus-biscoff-baked-cheesecake',
        name: 'Lotus Biscoff Baked Cheesecake',
        description:
          'A golden biscuit crust layered with smooth baked cream cheese and swirls of signature Lotus Biscoff spread finished with a generous crumble of caramelized cookies. Every bite offers the perfect blend of dense creamy richness and warm spiced sweetness.',
        variants: createVariants(),
      },

      {
        id: 'all-7-flavours-cheesecake',
        name: 'All 7 Flavours Cheesecake',
        description:
          'An indulgent seven signature baked cheesecake flavors from fruity glazes to rich chocolate caramel and creamy Biscoff—all on a classic buttery crust.',
        variants: createVariants(),
        featured: true,
      },
    ],
  },

  {
    id: 'no-bake-cheesecake',
    name: 'No Bake Cheesecake',
    category: 'No Bake Cheesecake',

    currentListedSize: '180g',
    currentListedPrice: 165,

    products: [
      {
        id: 'blueberry-no-bake-cheesecake',
        name: 'Blueberry Cheesecake',
        description:
          'A silky light-as-air cream cheese filling layered over a crisp biscuit base finished with a vibrant burst of sweet tangy blueberry compote—no oven required.',
        variants: createVariants(),
      },

      {
        id: 'strawberry-no-bake-cheesecake',
        name: 'Strawberry Cheesecake',
        description:
          'An ultra-creamy, light cheesecake set over a buttery cookie base topped with a bright glistening layer of sweet fresh strawberry glaze.',
        variants: createVariants(),
      },

      {
        id: 'pineapple-no-bake-cheesecake',
        name: 'Pineapple Cheesecake',
        description:
          'A refreshing, light-as-air cream cheese layered over a buttery biscuit base crowned with a bright sunny swirl of sweet pineapple glaze and crushed fruit.',
        variants: createVariants(),
      },

      {
        id: 'mango-no-bake-cheesecake',
        name: 'Mango Cheesecake',
        description:
          'A light, velvety mango-infused set over a buttery cookie crust finished with a bright tropical glaze of sweet, ripened mango.',
        variants: createVariants(),
      },

      {
        id: 'nutella-no-bake-cheesecake',
        name: 'Nutella Cheesecake',
        description:
          'Creamy dessert with a smooth chocolate flavor. It typically has a crunchy biscuit base, a thick and velvety Nutella cheesecake filling and a soft texture because it is chilled rather than baked.',
        variants: createVariants(),
      },

      {
        id: 'caramel-no-bake-cheesecake',
        name: 'Caramel Cheesecake',
        description:
          'A velvety chilled caramel-infused set on a buttery biscuit base finished with a generous drizzle of silky golden caramel glaze and a hint of warm sweetness.',
        variants: createVariants(),
      },

      {
        id: 'lotus-biscoff-no-bake-cheesecake',
        name: 'Lotus Biscoff Cheesecake',
        description:
          'A light velvety cream cheese layered over a spiced cookie crust infused with smooth Biscoff spread and topped with a generous crumble of caramelized biscuit.',
        variants: createVariants(),
      },
    ],
  },

  {
    id: 'tiramisu',
    name: 'Tiramisu',
    category: 'Tiramisu',

    currentListedSize: '200g',
    currentListedPrice: 220,

    products: [
      {
        id: 'classic-tiramisu',
        name: 'Classic Tiramisu',
        description:
          'Delicate ladyfingers soaked in dark bold espresso and a touch of liqueur layered with a cloud-like mascarpone cream and finished with a generous dusting of rich cocoa powder.',
        variants: createVariants(),
      },

      {
        id: 'lotus-biscoff-tiramisu',
        name: 'Lotus Biscoff Tiramisu',
        description:
          'Crisp ladyfingers dipped in warm Biscoff-infused coffee layered with a cloud of light mascarpone cream and finished with a rich drizzle of Biscoff spread and caramelized cookie crumble.',
        variants: createVariants(),
      },

      {
        id: 'nutella-tiramisu',
        name: 'Nutella Tiramisu',
        description:
          'Ladyfingers soaked in rich espresso layered with a velvety mascarpone cream topped with Nutella spread.',
        variants: createVariants(),
      },
    ],
  },
]

export default menuData