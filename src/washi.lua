require "files"
require "strings"

function parse_block(text)
    local block = ""
    local check_count = 1
    for i = 1, #text do
        local c = string.sub(text, i, i)
        if c == "}" then
            if check_count <= 1 then
                local lines = split(block, "\n")
                local result = ""
                for k, v in pairs(lines) do
                    result = result .. trim(v) .. "\n"
                end
                return trim(result)
            else
                check_count = check_count - 1
            end
        elseif c == "{" then
            check_count = check_count + 1
        end
        block = block .. c
    end
    return block
end

function get_loop(line)
    local loop = {}
    local is_for_loop = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+[%g]+%)[%s]*{")
    if is_for_loop then
        loop.value_key = string.match(line, "for[%s]*%(let[%s]+([%g]+)[%s]+of[%s]+[%g]+%)[%s]*{")
        loop.list_key = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+([%g]+)%)[%s]*{")
    end
    return loop
end

function parse_for_loops(html)
    local loops = {}
    local length = 0
    local lines = split(html, "\n")
    local index = 1
    for k, v in pairs(lines) do
        if k > index then
            local loop = get_loop(v)
            if loop.list_key then
                local text = ""
                for i = k + 1, #lines do
                    text = text .. lines[i] .. "\n"
                end
                loop.html = parse_block(text)
                index = k + #split(loop.html, "\n") + 1
                loop.id = random_string(7)
                loops[length + 1] = loop
                length = length + 1
            end
        end
    end
    return loops
end

function get_if(line)
    local statement = {}
    local is_if_statement = string.match(line, "if[%s]*%(.+%)[%s]*{")
    if is_if_statement then
        statement.value = string.match(line, "if[%s]*%(([.]+)%)[%s]*{")
    end
    return statement
end

function parse_ifs(html)
    local ifs = {}
    local length = 0
    local lines = split(html, "\n")
    local index = 1
    for k, v in pairs(lines) do
        if k > index then
            local statement = get_if(v)
            if statement.value then
                local text = ""
                for i = k + 1, #lines do
                    text = text .. lines[i] .. "\n"
                end
                statement.html = parse_block(text)
                index = k + #split(statement.html, "\n") + 1
                statement.id = random_string(7)
                ifs[length + 1] = statement
                length = length + 1
            end
        end
    end
    return ifs
end

function parse_html(block, html)
    block.loops = parse_for_loops(html)

    -- TODO(Jesper): Don't return if statements that are inside another block.
    block.ifs = parse_ifs(html)
    for k, v in pairs(block.loops) do
        --print("FOR:")
        --print(v.html .. "\n\n")
        parse_html(v, v.html)
    end
    for k, v in pairs(block.ifs) do
        --print("IF:")
        --print(v.html .. "\n\n")
        parse_html(v, v.html)
    end
end

local file = 'washi.config'
local lines = lines_from(file)

components = {}

for k, v in pairs(lines) do
    parts = split(v, " ")
    components[k] = { html = parts[1], js = parts[2] }
end

for k, v in pairs(components) do
    js = read_all(v.js)
    html = read_all(v.html)

    local block = {}
    parse_html(block, html)
    --parse_html(block, "<h2>Item!!!</h2>")

    ifs = {}
end