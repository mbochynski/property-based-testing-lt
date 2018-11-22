class List {
  data: number[] = [];
  push = (v: number) => this.data.push(v);
  pop = () => this.data.pop();
  size = () => this.data.length ;
}

export { List }