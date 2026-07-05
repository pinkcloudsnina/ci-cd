import { PagesList } from './base/enums';
import { isPlantsId } from './base/helpers';
import Cart from './components/cart';
import CartPage from './pages/cart-page';
import CatalogPage from './pages/catalog-page';
import ErrorPage from './pages/error-page';
import PlantPage from './pages/plant-page';

const IS_PRODUCTION = window.location.hostname.includes('github.io');
const BASE_PATH = IS_PRODUCTION ? '/ci-cd' : '';

class Router {
  static catalogPage: CatalogPage;
  static cartPage: CartPage;
  static plantPage: PlantPage;
  static errorPage: ErrorPage;

  constructor(cart: Cart) {
    Router.catalogPage = new CatalogPage(cart);
    Router.cartPage = new CartPage(cart);
    Router.plantPage = new PlantPage(cart);
    Router.errorPage = new ErrorPage(cart);
  }

  static getCleanPath(pathname: string): string {
    if (IS_PRODUCTION && pathname.startsWith(BASE_PATH)) {
      return pathname.slice(BASE_PATH.length) || '/';
    }
    return pathname;
  }

  static render(rawPathname: string) {
    // console.log('render:', pathname);
    const pathname = Router.getCleanPath(rawPathname);

    switch (pathname) {
      case PagesList.catalogPage:
        Router.catalogPage.draw();
        break;
      case PagesList.cartPage:
        Router.cartPage.draw();
        break;
      case '/':
        this.goTo(PagesList.catalogPage);
        break;
      default:
        if (isPlantsId(pathname)) {
          Router.plantPage.draw(pathname.slice(1));
        } else {
          Router.errorPage.draw();
        }
        break;
    }
    Router.changeLinks();
  }

  static goTo(pageId: string) {
    const fullPath = `${BASE_PATH}${pageId}`;
    window.history.pushState({ pageId }, pageId, fullPath);
    Router.render(fullPath);
    window.scrollTo(0, 0);
  }

  static changeLinks() {
    const links = document.querySelectorAll('[href^="/"]');
    links.forEach((link) => {
      if (!link.classList.contains('link-changed')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (link instanceof HTMLAnchorElement) {
            const targetPath = new URL(link.href).pathname;
            const currentPath = new URL(window.location.href).pathname;

            if (Router.getCleanPath(targetPath) !== '/catalog' || Router.getCleanPath(currentPath) !== '/catalog') {
              Router.goTo(Router.getCleanPath(targetPath));
            }
          }
        });
        link.classList.add('link-changed');
      }
    });
  }

  static startRouter() {
    window.addEventListener('popstate', () => {
      Router.render(new URL(window.location.href).pathname);
    });
    const page = new URL(window.location.href).pathname;
    Router.render(page);
  }
}

export default Router;
