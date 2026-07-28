import sys

def solve():
    lines = sys.stdin.read().splitlines()
    arr = list(map(int, lines[0].split())) if lines else []
    target = int(lines[1]) if len(lines) > 1 else 0

    # TODO: implement your solution using arr and target
    print(0)

if __name__ == "__main__":
    solve()
