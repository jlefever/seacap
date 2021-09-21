import React from "react";

export interface AttributeTableProps<T> {
    items: Map<T, React.ReactChild>;
    attributes: ((item: T) => React.ReactChild)[];
}

function AttributeTable<T>(props: AttributeTableProps<T>) {
    const { items, attributes } = props;

    return <table className="ui very basic table">
        <tbody>
            {Array.from(items.entries(), ([key, ele], i) => <tr key={i}>
                <td>{ele}</td>
                {attributes.map((getElement, j) => <td key={j} className="collapsing">
                    {getElement(key)}
                </td>)}
            </tr>)}
        </tbody>
    </table>
}

export default AttributeTable;