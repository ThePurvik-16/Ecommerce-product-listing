export interface SingleProduct {
    id: number;
    title: string;
    variants: Variant[];
    image: Image;
    discount?:string
}

export interface SelectedProducts {
    parent: number;
    child: number[];
}


interface Variant {
    id: number;
    product_id: number;
    title: string;
    discount?:string;
    price: string;
}

interface Image {
    id: number;
    product_id: number;
    src: string;
}


export type AddProductType = 'product' | 'variant'