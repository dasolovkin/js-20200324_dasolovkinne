import tooltip from "./index";

describe("tooltip", () => {
  beforeEach(() => {
    document.body.insertAdjacentHTML('beforeend', `
    <div data-tooltip="foo">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi enim esse sapiente.
      Necessitatibus praesentium similique voluptatem.
      <div data-tooltip="bar-bar-bar">
        Aperiam consectetur dignissimos dolores ex mollitia.
      </div>
      Alias aliquid animi corporis debitis, eveniet explicabo facilis hic laborum magni nisi nulla
      numquam odio omnis quaerat quas quia, reiciendis repellat repellendus sint sit soluta suscipit
      temporibus voluptate.
    </div>`);

    tooltip.initialize();
  });

  afterEach(() => {
    tooltip.destroy();
  });

  it("should be rendered correctly", () => {
    tooltip.render('');
    expect(tooltip.element).toBeVisible();
    expect(tooltip.element).toBeInTheDocument();
  });

  it("should be show a tooltip 'bar-bar-bar'", () => {
    const testTooolTipHTML = 'bar-bar-bar';
    const testTooolTipElement = document.querySelector(`div[data-tooltip="${testTooolTipHTML}"]`);

    let event = new Event("mouseover", {bubbles: true});
    testTooolTipElement.dispatchEvent(event); 

    const toolTip = document.querySelector('div.tooltip');
    expect(toolTip.innerHTML).toEqual(testTooolTipHTML);    
  });

  it("should be show a tooltip 'foo'", () => {
    const testTooolTipHTML = 'foo';
    const testTooolTipElement = document.querySelector(`div[data-tooltip="${testTooolTipHTML}"]`);

    let event = new Event("mouseover", {bubbles: true});
    testTooolTipElement.dispatchEvent(event); 

    const toolTip = document.querySelector('div.tooltip');
    expect(toolTip.innerHTML).toEqual(testTooolTipHTML);    
  });
});
