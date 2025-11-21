import clsx, { ClassArray } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...className: ClassArray) => twMerge(clsx(className))