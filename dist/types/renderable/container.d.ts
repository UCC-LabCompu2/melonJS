/**
 * @classdesc
 * Container represents a collection of child objects
 * @augments Renderable
 */
export default class Container extends Renderable {
    /**
     * @param {number} [x=0] - position of the container (accessible via the inherited pos.x property)
     * @param {number} [y=0] - position of the container (accessible via the inherited pos.y property)
     * @param {number} [width=game.viewport.width] - width of the container
     * @param {number} [height=game.viewport.height] - height of the container
     */
    constructor(x?: number | undefined, y?: number | undefined, width?: number | undefined, height?: number | undefined, root?: boolean);
    /**
     * keep track of pending sort
     * @ignore
     */
    pendingSort: any;
    /**
     * whether the container is the root of the scene
     * @type {boolean}
     * @default false
     */
    root: boolean;
    /**
     * The array of children of this container.
     * @ignore
     */
    children: any[] | undefined;
    /**
     * The property of the child object that should be used to sort on <br>
     * value : "x", "y", "z"
     * @type {string}
     * @default me.game.sortOn
     */
    sortOn: string;
    /**
     * Specify if the children list should be automatically sorted when adding a new child
     * @type {boolean}
     * @default true
     */
    autoSort: boolean;
    /**
     * Specify if the children z index should automatically be managed by the parent container
     * @type {boolean}
     * @default true
     */
    autoDepth: boolean;
    /**
     * Specify if the container draw operation should clip his children to its own bounds
     * @type {boolean}
     * @default false
     */
    clipping: boolean;
    /**
     * a callback to be extended, triggered after a child has been added or removed
     * @param {number} index - added or removed child index
     */
    onChildChange: (index: number) => void;
    /**
     * Specify if the container bounds should automatically take in account
     * all child bounds when updated (this is expensive and disabled by default,
     * only enable if necessary)
     * @type {boolean}
     * @default false
     */
    enableChildBoundsUpdate: boolean;
    /**
     * define a background color for this container
     * @type {Color}
     * @default (0, 0, 0, 0.0)
     * @example
     * // add a red background color to this container
     * this.backgroundColor.setColor(255, 0, 0);
     */
    backgroundColor: Color;
    /**
     * Used by the debug panel plugin
     * @ignore
     */
    drawCount: number;
    /**
     * reset the container, removing all childrens, and reseting transforms.
     */
    reset(): void;
    /**
     * Add a child to the container <br>
     * if auto-sort is disable, the object will be appended at the bottom of the list.
     * Adding a child to the container will automatically remove it from its other container.
     * Meaning a child can only have one parent.  This is important if you add a renderable
     * to a container then add it to the me.game.world container it will move it out of the
     * orginal container. Then when the me.game.world.reset() is called the renderable
     * will not be in any container. <br>
     * if the given child implements a onActivateEvent method, that method will be called
     * once the child is added to this container.
     * @param {Renderable} child
     * @param {number} [z] - forces the z index of the child to the specified value
     * @returns {Renderable} the added child
     */
    addChild(child: Renderable, z?: number | undefined): Renderable;
    /**
     * Add a child to the container at the specified index<br>
     * (the list won't be sorted after insertion)
     * @param {Renderable} child
     * @param {number} index
     * @returns {Renderable} the added child
     */
    addChildAt(child: Renderable, index: number): Renderable;
    /**
     * The forEach() method executes a provided function once per child element. <br>
     * the callback function is invoked with three arguments: <br>
     *    - The current element being processed in the array <br>
     *    - The index of element in the array. <br>
     *    - The array forEach() was called upon. <br>
     * @param {Function} callback - fnction to execute on each element
     * @param {object} [thisArg] - value to use as this(i.e reference Object) when executing callback.
     * @example
     * // iterate through all children of the root container
     * me.game.world.forEach((child) => {
     *    // do something with the child
     *    child.doSomething();
     * });
     * me.game.world.forEach((child, index) => { ... });
     * me.game.world.forEach((child, index, array) => { ... });
     * me.game.world.forEach((child, index, array) => { ... }, thisArg);
     */
    forEach(callback: Function, thisArg?: object | undefined, ...args: any[]): void;
    /**
     * Swaps the position (z-index) of 2 children
     * @param {Renderable} child
     * @param {Renderable} child2
     */
    swapChildren(child: Renderable, child2: Renderable): void;
    /**
     * Returns the Child at the specified index
     * @param {number} index
     * @returns {Renderable} the child at the specified index
     */
    getChildAt(index: number): Renderable;
    /**
     * Returns the index of the given Child
     * @param {Renderable} child
     * @returns {number} index
     */
    getChildIndex(child: Renderable): number;
    /**
     * Returns the next child within the container or undefined if none
     * @param {Renderable} child
     * @returns {Renderable} child
     */
    getNextChild(child: Renderable): Renderable;
    /**
     * Returns true if contains the specified Child
     * @param {Renderable} child
     * @returns {boolean}
     */
    hasChild(child: Renderable): boolean;
    /**
     * return the child corresponding to the given property and value.<br>
     * note : avoid calling this function every frame since
     * it parses the whole object tree each time
     * @param {string} prop - Property name
     * @param {string|RegExp|number|boolean} value - Value of the property
     * @returns {Renderable[]} Array of childs
     * @example
     * // get the first child object called "mainPlayer" in a specific container :
     * var ent = myContainer.getChildByProp("name", "mainPlayer");
     *
     * // or query the whole world :
     * var ent = me.game.world.getChildByProp("name", "mainPlayer");
     *
     * // partial property matches are also allowed by using a RegExp.
     * // the following matches "redCOIN", "bluecoin", "bagOfCoins", etc :
     * var allCoins = me.game.world.getChildByProp("name", /coin/i);
     *
     * // searching for numbers or other data types :
     * var zIndex10 = me.game.world.getChildByProp("z", 10);
     * var inViewport = me.game.world.getChildByProp("inViewport", true);
     */
    getChildByProp(prop: string, value: string | RegExp | number | boolean): Renderable[];
    /**
     * returns the list of childs with the specified class type
     * @param {object} classType
     * @returns {Renderable[]} Array of children
     */
    getChildByType(classType: object): Renderable[];
    /**
     * returns the list of childs with the specified name<br>
     * as defined in Tiled (Name field of the Object Properties)<br>
     * note : avoid calling this function every frame since
     * it parses the whole object list each time
     * @param {string|RegExp|number|boolean} name - child name
     * @returns {Renderable[]} Array of children
     */
    getChildByName(name: string | RegExp | number | boolean): Renderable[];
    /**
     * return the child corresponding to the specified GUID<br>
     * note : avoid calling this function every frame since
     * it parses the whole object list each time
     * @param {string|RegExp|number|boolean} guid - child GUID
     * @returns {Renderable} corresponding child or null
     */
    getChildByGUID(guid: string | RegExp | number | boolean): Renderable;
    /**
     * return all child in this container
     * @returns {Renderable[]} an array of renderable object
     */
    getChildren(): Renderable[];
    /**
     * Checks if this container is root or if it's attached to the root container.
     * @private
     * @returns {boolean}
     */
    private isAttachedToRoot;
    /**
     * @ignore
     */
    onActivateEvent(): void;
    /**
     * Invokes the removeChildNow in a defer, to ensure the child is removed safely after the update & draw stack has completed. <br>
     * if the given child implements a onDeactivateEvent() method, that method will be called once the child is removed from this container.
     * @param {Renderable} child
     * @param {boolean} [keepalive=false] - true to prevent calling child.destroy()
     */
    removeChild(child: Renderable, keepalive?: boolean | undefined): void;
    /**
     * Removes (and optionally destroys) a child from the container.<br>
     * (removal is immediate and unconditional)<br>
     * Never use keepalive=true with objects from {@link pool}. Doing so will create a memory leak.
     * @param {Renderable} child
     * @param {boolean} [keepalive=False] - True to prevent calling child.destroy()
     */
    removeChildNow(child: Renderable, keepalive?: boolean | undefined): void;
    /**
     * Automatically set the specified property of all childs to the given value
     * @param {string} prop - property name
     * @param {object} value - property value
     * @param {boolean} [recursive=false] - recursively apply the value to child containers if true
     */
    setChildsProperty(prop: string, value: object, recursive?: boolean | undefined): void;
    /**
     * Move the child in the group one step forward (z depth).
     * @param {Renderable} child
     */
    moveUp(child: Renderable): void;
    /**
     * Move the child in the group one step backward (z depth).
     * @param {Renderable} child
     */
    moveDown(child: Renderable): void;
    /**
     * Move the specified child to the top(z depth).
     * @param {Renderable} child
     */
    moveToTop(child: Renderable): void;
    /**
     * Move the specified child the bottom (z depth).
     * @param {Renderable} child
     */
    moveToBottom(child: Renderable): void;
    /**
     * Manually trigger the sort of all the childs in the container</p>
     * @param {boolean} [recursive=false] - recursively sort all containers if true
     */
    sort(recursive?: boolean | undefined): void;
    /**
     * @ignore
     */
    onDeactivateEvent(): void;
    /**
     * Z Sorting function
     * @ignore
     */
    _sortZ(a: any, b: any): number;
    /**
     * Reverse Z Sorting function
     * @ignore
     */
    _sortReverseZ(a: any, b: any): number;
    /**
     * X Sorting function
     * @ignore
     */
    _sortX(a: any, b: any): number;
    /**
     * Y Sorting function
     * @ignore
     */
    _sortY(a: any, b: any): number;
}
import Renderable from "./renderable";
