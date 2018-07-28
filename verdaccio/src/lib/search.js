// @flow

import lunr from 'lunr';
import type {Version} from '@verdaccio/types';
import type {IStorageHandler, IWebSearch} from '../../types';
/**
 * Handle the search Indexer.
 */
class Search implements IWebSearch {
  index: any;
  storage: IStorageHandler;

  /**
   * Constructor.
   */
  constructor() {
    /* eslint no-invalid-this: "off" */
    this.index = lunr(function() {
      this.field('name', {boost: 10});
      this.field('description', {boost: 4});
      this.field('author', {boost: 6});
      this.field('readme');
    });
  }

  /**
   * Performs a query to the indexer.
   * If the keyword is a * it returns all local elements
   * otherwise performs a search
   * @param {*} q the keyword
   * @return {Array} list of results.
   */
  query(query: string) {
    return query === '*'
      ? this.storage.localStorage.localData.get((items) => {
        items.map( function( pkg ) {
          return {ref: pkg, score: 1};
        });
      }) : this.index.search(query);
  }

  /**
   * Add a new element to index
   * @param {*} pkg the package
   */
  add(pkg: Version) {
    this.index.add({
      id: pkg.name,
      name: pkg.name,
      description: pkg.description,
      author: pkg._npmUser ? pkg._npmUser.name : '???',
    });
  }

  /**
   * Remove an element from the index.
   * @param {*} name the id element
   */
  remove(name: string) {
    this.index.remove({id: name});
  }

  /**
   * Force a reindex.
   */
  reindex() {
    let self = this;
    this.storage.getLocalDatabase(function(err, packages) {
      if (err) throw err; // that function shouldn't produce any
      let i = packages.length;
      while (i--) {
        self.add(packages[i]);
      }
    });
  }

  /**
   * Set up the {Storage}
   * @param {*} storage An storage reference.
   */
  configureStorage(storage: IStorageHandler) {
    this.storage = storage;
    this.reindex();
  }
}

export default new Search();
